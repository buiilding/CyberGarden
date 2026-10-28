"""Server-only Supabase PKCE authentication and owner validation."""

import base64
from dataclasses import dataclass
import hashlib
import hmac
import json
import os
from pathlib import Path
import re
import secrets
import threading
import time
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode, urlsplit
from urllib.request import HTTPRedirectHandler, Request, build_opener

EDITOR_ROUTE = re.compile(r"/editor(?:/[A-Za-z0-9_-]+)?/?")
FLOW_COOKIE = "cg_login"
SESSION_COOKIE = "cg_session"
FLOW_SECONDS = 600
SESSION_SECONDS = 8 * 60 * 60


class AuthError(Exception):
    def __init__(self, status=401):
        self.status = status
        super().__init__("Authentication unavailable" if status == 503 else "Authentication denied")


def load_local_env(root):
    """Read literal KEY=value lines, never execute a shell or expand variables."""
    path = Path(root) / ".env.local"
    if not path.is_file():
        return
    for line in path.read_text().splitlines():
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        key, separator, value = line.partition("=")
        if not separator or not re.fullmatch(r"[A-Z][A-Z0-9_]*", key.strip()):
            raise ValueError("Invalid .env.local format; use KEY=value lines.")
        value = value.strip()
        if len(value) >= 2 and value[0] == value[-1] and value[0] in "\"'":
            value = value[1:-1]
        os.environ.setdefault(key.strip(), value)


@dataclass(frozen=True)
class Config:
    origin: str
    supabase_url: str
    publishable_key: str
    owner_emails: frozenset

    @classmethod
    def from_env(cls):
        origin = os.environ.get("APP_ORIGIN", "http://localhost:4183").rstrip("/")
        parsed = urlsplit(origin)
        local = parsed.scheme == "http" and parsed.hostname in {"localhost", "127.0.0.1"} and parsed.port == 4183
        hosted = parsed.scheme == "https" and parsed.hostname and parsed.hostname not in {"localhost", "127.0.0.1"}
        if (not (local or hosted) or parsed.path or parsed.query or parsed.fragment or parsed.username or parsed.password):
            raise ValueError("APP_ORIGIN must be a loopback development origin or HTTPS deployment origin.")
        if hosted and not os.environ.get('DATABASE_URL'):
            raise ValueError('Hosted deployments require DATABASE_URL and persistent sessions.')
        url = os.environ.get("SUPABASE_URL", "").rstrip("/")
        key = os.environ.get("SUPABASE_PUBLISHABLE_KEY", "")
        emails = frozenset(email.strip().lower() for email in os.environ.get("OWNER_EMAIL_ALLOWLIST", "").split(",") if email.strip())
        if url:
            target = urlsplit(url)
            if (target.scheme != "https" or not target.hostname or target.path or target.query
                    or target.fragment or target.username or target.password):
                raise ValueError("SUPABASE_URL must be an HTTPS project origin.")
        if key and not key.startswith("sb_publishable_"):
            raise ValueError("Use a Supabase publishable key, never a secret or service-role key.")
        if any("*" in email or not re.fullmatch(r"[^\s@,]+@[^\s@,]+\.[^\s@,]+", email) for email in emails):
            raise ValueError("OWNER_EMAIL_ALLOWLIST must contain exact email addresses.")
        return cls(origin, url, key, emails)

    @property
    def configured(self):
        return bool(self.supabase_url and self.publishable_key and self.owner_emails)


class NoRedirect(HTTPRedirectHandler):
    def redirect_request(self, *args, **kwargs):
        return None  # Never forward API keys or bearer tokens to another host.


class SupabaseAuth:
    def __init__(self, config):
        self.config = config
        self.http = build_opener(NoRedirect())

    def request(self, method, path, payload=None, token=None):
        headers = {"apikey": self.config.publishable_key, "Accept": "application/json"}
        if token:
            headers["Authorization"] = f"Bearer {token}"
        data = None
        if payload is not None:
            headers["Content-Type"] = "application/json"
            data = json.dumps(payload).encode()
        request = Request(f"{self.config.supabase_url}/auth/v1{path}", data=data, headers=headers, method=method)
        try:
            with self.http.open(request, timeout=10) as response:
                raw = response.read(1024 * 1024 + 1)
                if len(raw) > 1024 * 1024:
                    raise AuthError(503)
                return json.loads(raw) if raw else {}
        except HTTPError as error:
            status = 401 if error.code in {400, 401, 403, 422} else 503
            error.close()
            raise AuthError(status) from None
        except (URLError, TimeoutError, OSError, ValueError):
            raise AuthError(503) from None


class AuthService:
    def __init__(self, config):
        self.config = config
        self.provider = SupabaseAuth(config)
        self.flows = {}
        self.sessions = {}
        self.connections = {}
        self.lock = threading.RLock()

    def prune(self):
        now = time.time()
        for records in (self.flows, self.sessions):
            for key in list(records):
                if records[key]["deadline"] <= now:
                    del records[key]

    def new_flow(self, next_path):
        if not self.config.configured:
            raise AuthError(503)
        with self.lock:
            self.prune()
            if len(self.flows) >= 128:
                raise AuthError(503)
            flow_id = secrets.token_urlsafe(32)
            self.flows[flow_id] = {
                "csrf": secrets.token_urlsafe(32), "deadline": time.time() + FLOW_SECONDS,
                "next": next_path if EDITOR_ROUTE.fullmatch(next_path) else "/editor",
                "verifier": None,
            }
            return flow_id, self.flows[flow_id]["csrf"]

    def begin(self, flow_id, csrf):
        with self.lock:
            self.prune()
            flow = self.flows.get(flow_id)
            if not flow or not hmac.compare_digest(flow["csrf"].encode(), csrf.encode()) or flow["verifier"]:
                raise AuthError()
            verifier = secrets.token_urlsafe(48)
            flow["verifier"] = verifier
            challenge = base64.urlsafe_b64encode(hashlib.sha256(verifier.encode()).digest()).decode().rstrip("=")
            return self.config.supabase_url + "/auth/v1/authorize?" + urlencode({
                "provider": "google", "redirect_to": self.config.origin + "/auth/callback",
                "code_challenge": challenge, "code_challenge_method": "s256",
                "scopes": "openid email profile", "prompt": "select_account",
            })

    def owner(self, user):
        # /user is fetched from Supabase with the access token. Never authorize
        # from user_metadata, a browser email, or an unverified JWT decode.
        if not isinstance(user, dict):
            raise AuthError(403)
        email = str(user.get("email", "")).strip().lower()
        identities = user.get("identities")
        if not isinstance(identities, list) or not isinstance(user.get("app_metadata"), dict):
            raise AuthError(403)
        google = any(
            isinstance(identity, dict) and isinstance(identity.get("identity_data"), dict)
            and
            identity.get("provider") == "google"
            and str(identity.get("identity_data", {}).get("email", "")).strip().lower() == email
            and identity.get("identity_data", {}).get("email_verified") is True
            for identity in identities
        )
        if (not user.get("id") or user.get("is_anonymous") or not user.get("email_confirmed_at")
                or email not in self.config.owner_emails or not google
                or user.get("app_metadata", {}).get("provider") != "google"):
            raise AuthError(403)
        return user

    def token_fields(self, result):
        try:
            access, refresh = result["access_token"], result["refresh_token"]
            lifetime = int(result["expires_in"])
            if not isinstance(access, str) or not access or not isinstance(refresh, str) or not refresh or lifetime <= 0:
                raise ValueError()
            return {"access": access, "refresh": refresh, "expires": time.time() + lifetime}
        except (KeyError, TypeError, ValueError):
            raise AuthError(503) from None

    def finish(self, flow_id, code):
        with self.lock:
            self.prune()
            flow = self.flows.pop(flow_id, None)
            if not flow or not flow["verifier"] or not code or len(code) > 4096:
                raise AuthError()
            tokens = self.token_fields(self.provider.request("POST", "/token?grant_type=pkce", {
                "auth_code": code, "code_verifier": flow["verifier"],
            }))
            user = self.owner(self.provider.request("GET", "/user", token=tokens["access"]))
            if len(self.sessions) >= 128:
                raise AuthError(503)
            session_id = secrets.token_urlsafe(32)
            self.sessions[session_id] = {
                **tokens, "user_id": user["id"], "csrf": secrets.token_urlsafe(32),
                "deadline": time.time() + SESSION_SECONDS,
                **({"youtube": self.connections[user["id"]]} if user["id"] in self.connections else {}),
            }
            return session_id, flow["next"]

    def validate(self, session_id):
        with self.lock:
            self.prune()
            session = self.sessions.get(session_id)
            if not session or not self.config.configured:
                raise AuthError()
            try:
                if session["expires"] <= time.time() + 30:
                    session.update(self.token_fields(self.provider.request("POST", "/token?grant_type=refresh_token", {"refresh_token": session["refresh"]})))
                user = self.owner(self.provider.request("GET", "/user", token=session["access"]))
                if user["id"] != session["user_id"]:
                    raise AuthError(403)
                return session
            except AuthError as error:
                if error.status != 503:
                    self.sessions.pop(session_id, None)
                raise

    def logout(self, session_id, csrf):
        with self.lock:
            session = self.sessions.get(session_id)
            if not session or not hmac.compare_digest(session["csrf"].encode(), csrf.encode()):
                raise AuthError(403)
            self.sessions.pop(session_id, None)
            try:
                self.provider.request("POST", "/logout?scope=local", token=session["access"])
            except AuthError:
                pass
