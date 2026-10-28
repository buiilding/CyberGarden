import time
import unittest
from unittest.mock import patch
from urllib.parse import parse_qs, urlsplit
from youtube_upload import YouTubeService, YouTubeError, SCOPES


class YouTubeAuthorizationTests(unittest.TestCase):
    def setUp(self):
        with patch.dict('os.environ', {'YOUTUBE_CLIENT_ID': 'fixture-client', 'YOUTUBE_CLIENT_SECRET': 'fixture-secret'}):
            self.service = YouTubeService('http://localhost:4183')
        self.session = {}
        self.calls = []
        self.service.request = self.provider

    def provider(self, url, payload=None, token=None):
        self.calls.append((url, payload, token))
        if '/token' in url:
            return {'access_token': 'fixture-token', 'refresh_token': 'fixture-refresh', 'expires_in': 3600, 'scope': ' '.join(SCOPES)}
        if '/channels?' in url:
            return {'items': [{'id': 'fixture-channel', 'snippet': {'title': 'My channel'}}]}
        return {'items': [{'id': 'abcdefghijk', 'snippet': {'channelId': 'fixture-channel'}, 'status': {'uploadStatus': 'processed', 'embeddable': True}}]}

    def connect(self):
        query = parse_qs(urlsplit(self.service.begin('owner-session')).query)
        self.assertEqual(set(query['scope'][0].split()), SCOPES)
        self.assertEqual(query['code_challenge_method'], ['S256'])
        self.service.finish('owner-session', self.session, query['state'][0], 'fixture-code')
        return query

    def test_pkce_channel_connection_replay_and_session_binding(self):
        query = parse_qs(urlsplit(self.service.begin('owner-session')).query)
        with self.assertRaises(YouTubeError):
            self.service.finish('other-session', {}, query['state'][0], 'fixture-code')
        self.service.finish('owner-session', self.session, query['state'][0], 'fixture-code')
        self.assertEqual(self.session['youtube']['channel_title'], 'My channel')
        self.assertIn('code_verifier', self.calls[0][1])
        with self.assertRaises(YouTubeError):
            self.service.finish('owner-session', self.session, query['state'][0], 'fixture-code')

    def test_refresh_and_processing_owned_by_connected_channel(self):
        self.connect()
        self.session['youtube']['expires'] = time.time() - 1
        self.assertEqual(self.service.access(self.session), 'fixture-token')
        self.assertEqual(self.calls[-1][1]['grant_type'], 'refresh_token')
        self.assertEqual(self.service.video(self.session, 'abcdefghijk')['status']['uploadStatus'], 'processed')
        self.session['youtube']['channel_id'] = 'another-channel'
        with self.assertRaises(YouTubeError):
            self.service.video(self.session, 'abcdefghijk')

    def test_denied_permissions_do_not_connect(self):
        original = self.provider
        def missing_read(url, payload=None, token=None):
            result = original(url, payload, token)
            result['scope'] = 'https://www.googleapis.com/auth/youtube.upload'
            return result
        self.service.request = missing_read
        with self.assertRaises(YouTubeError):
            self.connect()
        self.assertNotIn('youtube', self.session)

    def test_missing_config_and_expired_state(self):
        self.service.client_id = ''
        with self.assertRaises(YouTubeError):
            self.service.begin('owner-session')
        self.service.client_id = 'fixture-client'
        query = parse_qs(urlsplit(self.service.begin('owner-session')).query)
        self.service.flows[query['state'][0]]['expires'] = 0
        with self.assertRaises(YouTubeError):
            self.service.finish('owner-session', self.session, query['state'][0], 'code')
