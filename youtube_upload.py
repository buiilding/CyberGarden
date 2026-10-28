"""Session-bound Google authorization for local YouTube uploads. No disk tokens."""
import base64
import hashlib
import json
import os
import re
import secrets
import threading
import time
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, build_opener
from auth import NoRedirect

SCOPES = {'https://www.googleapis.com/auth/youtube.upload', 'https://www.googleapis.com/auth/youtube.readonly'}


class YouTubeError(Exception):
    def __init__(self, message, status=400):
        super().__init__(message)
        self.status = status


class YouTubeService:
    def __init__(self, origin):
        self.origin = origin
        self.client_id = os.environ.get('YOUTUBE_CLIENT_ID', '')
        self.client_secret = os.environ.get('YOUTUBE_CLIENT_SECRET', '')
        self.flows = {}
        self.lock = threading.RLock()
        self.http = build_opener(NoRedirect())

    @property
    def configured(self):
        return bool(self.client_id and self.client_secret)

    def request(self, url, payload=None, token=None):
        headers = {'Accept': 'application/json'}
        data = None
        if payload is not None:
            data = urlencode(payload).encode()
            headers['Content-Type'] = 'application/x-www-form-urlencoded'
        if token:
            headers['Authorization'] = 'Bearer ' + token
        try:
            with self.http.open(Request(url, data=data, headers=headers), timeout=20) as response:
                raw = response.read(1024 * 1024 + 1)
                if len(raw) > 1024 * 1024:
                    raise ValueError()
                return json.loads(raw) if raw else {}
        except HTTPError as error:
            status = error.code
            error.close()
            raise YouTubeError('YouTube authorization or API request failed. Reconnect YouTube if access expired.' if status in (400, 401, 403) else 'YouTube is temporarily unavailable. Try again.', 502) from None
        except (URLError, OSError, ValueError):
            raise YouTubeError('Could not reach YouTube. Check your connection and try again.', 502) from None

    def begin(self, session_id):
        if not self.configured:
            raise YouTubeError('Set YOUTUBE_CLIENT_ID and YOUTUBE_CLIENT_SECRET in .env.local and restart the server. See README.md.', 503)
        with self.lock:
            now = time.time()
            self.flows = {k: v for k, v in self.flows.items() if v['expires'] > now and v['session'] != session_id}
            if len(self.flows) >= 128:
                raise YouTubeError('Too many pending connections. Try again later.', 503)
            state, verifier = secrets.token_urlsafe(32), secrets.token_urlsafe(48)
            self.flows[state] = {'session': session_id, 'verifier': verifier, 'expires': now + 600}
            challenge = base64.urlsafe_b64encode(hashlib.sha256(verifier.encode()).digest()).decode().rstrip('=')
            return 'https://accounts.google.com/o/oauth2/v2/auth?' + urlencode({
                'client_id': self.client_id, 'redirect_uri': self.origin + '/youtube/callback',
                'response_type': 'code', 'scope': ' '.join(sorted(SCOPES)), 'state': state,
                'code_challenge': challenge, 'code_challenge_method': 'S256',
                'access_type': 'offline', 'prompt': 'consent select_account',
            })

    def finish(self, session_id, session, state, code):
        with self.lock:
            flow = self.flows.get(state)
            if not flow or flow['session'] != session_id or flow['expires'] <= time.time():
                raise YouTubeError('YouTube connection expired. Connect again.')
            self.flows.pop(state)
            if not code or len(code) > 4096:
                raise YouTubeError('YouTube permission was not granted. Connect again to try.')
            result = self.request('https://oauth2.googleapis.com/token', {
                'client_id': self.client_id, 'client_secret': self.client_secret,
                'redirect_uri': self.origin + '/youtube/callback', 'grant_type': 'authorization_code',
                'code': code, 'code_verifier': flow['verifier'],
            })
            if not SCOPES.issubset(set(result.get('scope', '').split())):
                raise YouTubeError('Grant both upload and read permissions so CyberGarden can wait for processing.')
            connection = self.tokens(result)
            connection['refresh'] = result.get('refresh_token')
            channels = self.request('https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true', token=connection['access']).get('items', [])
            if len(channels) != 1:
                raise YouTubeError('Choose a Google account with a YouTube channel, then reconnect.')
            connection.update(channel_id=channels[0]['id'], channel_title=channels[0]['snippet']['title'])
            session['youtube'] = connection

    def tokens(self, result):
        try:
            token, lifetime = result['access_token'], int(result['expires_in'])
            if not isinstance(token, str) or not token or lifetime <= 0:
                raise ValueError()
            return {'access': token, 'expires': time.time() + lifetime}
        except (KeyError, ValueError, TypeError):
            raise YouTubeError('Google returned an invalid token response.', 502) from None

    def access(self, session, force=False):
        with self.lock:
            connection = session.get('youtube')
            if not connection:
                raise YouTubeError('Connect YouTube before uploading.', 409)
            if force or connection['expires'] < time.time() + 60:
                if not connection.get('refresh'):
                    session.pop('youtube', None)
                    raise YouTubeError('YouTube access expired. Reconnect YouTube.', 409)
                connection.update(self.tokens(self.request('https://oauth2.googleapis.com/token', {
                    'client_id': self.client_id, 'client_secret': self.client_secret,
                    'grant_type': 'refresh_token', 'refresh_token': connection['refresh'],
                })))
            return connection['access']

    def video(self, session, video_id):
        if not re.fullmatch(r'[A-Za-z0-9_-]{11}', video_id):
            raise YouTubeError('Invalid video ID.')
        result = self.request('https://www.googleapis.com/youtube/v3/videos?' + urlencode({
            'part': 'snippet,status,processingDetails', 'id': video_id,
        }), token=self.access(session))
        items = result.get('items', [])
        if not items:
            return {'pending': True}
        video = items[0]
        if video['snippet']['channelId'] != session['youtube']['channel_id']:
            raise YouTubeError('This video belongs to another channel.', 403)
        return {'id': video['id'], 'status': video.get('status', {}), 'processingDetails': video.get('processingDetails', {})}
