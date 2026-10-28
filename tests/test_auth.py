"""Local HTTP integration tests. Google/Supabase are protocol fixtures, not real accounts."""

import base64
from dataclasses import replace
import hashlib
from http.cookies import SimpleCookie
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
import http.client
import json
import os
import secrets
import threading
import time
import unittest
from unittest.mock import patch
from urllib.parse import parse_qs, urlencode, urlsplit

from auth import Config
from server import make_server


def google_user(email="owner@example.test"):
    return {"id": "fixture-owner", "email": email, "email_confirmed_at": "2026-01-01T00:00:00Z", "is_anonymous": False,
            "app_metadata": {"provider": "google"}, "identities": [{"provider": "google", "identity_data": {"email": email, "email_verified": True}}]}


class ProviderFixture(BaseHTTPRequestHandler):
    def log_message(self, *args):
        pass

    def send(self, status, value=None, location=None):
        data = json.dumps(value or {}).encode()
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(data)))
        if location:
            self.send_header("Location", location)
        self.end_headers()
        self.wfile.write(data)

    def do_GET(self):
        parsed = urlsplit(self.path)
        if parsed.path == "/auth/v1/authorize":
            query = parse_qs(parsed.query)
            assert query["provider"] == ["google"]
            assert query["code_challenge_method"] == ["s256"]
            assert query["scopes"] == ["openid email profile"]
            code = secrets.token_urlsafe(16)
            self.server.codes[code] = query["code_challenge"][0]
            self.send(303, location=query["redirect_to"][0] + "?" + urlencode({"code": code}))
        elif parsed.path == "/auth/v1/user":
            self.server.user_calls += 1
            token = self.headers.get("Authorization", "").removeprefix("Bearer ")
            if self.server.offline:
                self.send(503)
            elif token not in self.server.tokens or self.server.revoked:
                self.send(401)
            else:
                self.send(200, self.server.user)
        else:
            self.send(404)

    def do_POST(self):
        parsed = urlsplit(self.path)
        data = json.loads(self.rfile.read(int(self.headers.get("Content-Length", "0"))) or b"{}")
        if parsed.path == "/auth/v1/token":
            grant = parse_qs(parsed.query)["grant_type"][0]
            if grant == "pkce":
                challenge = base64.urlsafe_b64encode(hashlib.sha256(data["code_verifier"].encode()).digest()).decode().rstrip("=")
                if self.server.codes.pop(data["auth_code"], None) != challenge:
                    self.send(400)
                    return
            elif grant == "refresh_token":
                self.server.refresh_calls += 1
                if data["refresh_token"] not in self.server.refreshes or self.server.revoked:
                    self.send(400)
                    return
                self.server.refreshes.remove(data["refresh_token"])
            else:
                self.send(400)
                return
            access, refresh = secrets.token_urlsafe(32), secrets.token_urlsafe(32)
            self.server.tokens.add(access)
            self.server.refreshes.add(refresh)
            self.send(200, {"access_token": access, "refresh_token": refresh, "expires_in": 3600,
                            "user": {"email": "DO-NOT-TRUST-TOKEN-RESPONSE@example.test"}})
        elif parsed.path == "/auth/v1/logout":
            assert parse_qs(parsed.query)["scope"] == ["local"]
            self.server.logout_calls += 1
            self.send(204)
        else:
            self.send(404)


class AuthHTTPTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.provider = ThreadingHTTPServer(("127.0.0.1", 0), ProviderFixture)
        cls.provider_thread = threading.Thread(target=cls.provider.serve_forever, daemon=True)
        cls.provider_thread.start()
        # HTTP provider injection is test-only. Config.from_env requires HTTPS.
        config = Config("http://localhost:0", f"http://127.0.0.1:{cls.provider.server_port}", "fixture-only-publishable-key", frozenset({"owner@example.test"}))
        cls.app = make_server(config, ("127.0.0.1", 0))
        cls.auth = cls.app.RequestHandlerClass.keywords["auth"]
        cls.auth.config = replace(config, origin=f"http://localhost:{cls.app.server_port}")
        cls.origin = cls.auth.config.origin
        cls.app_thread = threading.Thread(target=cls.app.serve_forever, daemon=True)
        cls.app_thread.start()

    @classmethod
    def tearDownClass(cls):
        for server in (cls.app, cls.provider):
            server.shutdown()
            server.server_close()
        cls.app_thread.join()
        cls.provider_thread.join()

    def setUp(self):
        self.cookies = {}
        self.auth.flows.clear()
        self.auth.sessions.clear()
        self.provider.codes = {}
        self.provider.tokens = set()
        self.provider.refreshes = set()
        self.provider.user = google_user()
        self.provider.revoked = self.provider.offline = False
        self.provider.user_calls = self.provider.refresh_calls = self.provider.logout_calls = 0

    def request(self, path, method="GET", data=None, origin=True, host=None):
        headers = {"Host": host or urlsplit(self.origin).netloc, "Cookie": "; ".join(f"{key}={value}" for key, value in self.cookies.items())}
        if origin:
            headers["Origin"] = self.origin if origin is True else origin
        body = urlencode(data) if data is not None else None
        if body is not None:
            headers["Content-Type"] = "application/x-www-form-urlencoded"
        connection = http.client.HTTPConnection("127.0.0.1", self.app.server_port, timeout=5)
        connection.request(method, path, body, headers)
        response = connection.getresponse()
        content = response.read().decode()
        result = (response.status, dict(response.getheaders()), content)
        for key, value in response.getheaders():
            if key.lower() == "set-cookie":
                jar = SimpleCookie(value)
                for name, cookie in jar.items():
                    if cookie["max-age"] == "0":
                        self.cookies.pop(name, None)
                    else:
                        self.cookies[name] = cookie.value
        connection.close()
        return result

    def start(self, next_path="/editor/home"):
        status, headers, _ = self.request("/auth/login?" + urlencode({"next": next_path}))
        self.assertEqual(status, 200)
        self.assertIn("HttpOnly", headers["Set-Cookie"])
        self.assertIn("SameSite=Lax", headers["Set-Cookie"])
        self.assertEqual(headers["Referrer-Policy"], "same-origin")
        flow = self.auth.flows[self.cookies["cg_login"]]
        status, headers, _ = self.request("/auth/login", "POST", {"csrf": flow["csrf"]})
        self.assertEqual(status, 303)
        parsed = urlsplit(headers["Location"])
        connection = http.client.HTTPConnection("127.0.0.1", self.provider.server_port)
        connection.request("GET", parsed.path + "?" + parsed.query)
        response = connection.getresponse()
        callback = response.getheader("Location")
        response.read()
        connection.close()
        return urlsplit(callback).path + "?" + urlsplit(callback).query

    def sign_in(self):
        response = self.request(self.start())
        self.assertEqual(response[0], 303)
        self.assertEqual(response[1]["Location"], "/editor/home")
        return response

    def test_public_pages_omit_editor_and_unauthenticated_editor_is_gated(self):
        for path in ("/", "/index.html", "/pages", "/page/note"):
            status, _, body = self.request(path)
            self.assertEqual(status, 200)
            self.assertNotIn('id="writing-body"', body)
            self.assertNotIn('id="editor-shell"', body)
        for path in ("/editor", "/editor/", "/editor/home", "/editor/note", "/%65ditor/home"):
            status, headers, body = self.request(path)
            self.assertEqual(status, 303)
            self.assertTrue(headers["Location"].startswith("/auth/login?"))
            self.assertNotIn('id="writing-body"', body)
        self.assertEqual(self.request("/auth/session")[0], 401)

    def test_owner_pkce_login_validated_editor_and_logout(self):
        _, headers, body = self.sign_in()
        self.assertEqual(headers["Referrer-Policy"], "no-referrer")
        self.assertNotIn("access_token", body + repr(headers))
        before = self.provider.user_calls
        status, headers, body = self.request("/editor/home")
        self.assertEqual(status, 200)
        self.assertIn('id="writing-body"', body)
        self.assertIn('id="page-reference-menu"', body)
        self.assertIn('id="sign-out"', body)
        self.assertEqual(headers["Cache-Control"], "no-store")
        self.assertEqual(headers["Referrer-Policy"], "strict-origin-when-cross-origin")
        self.assertGreater(self.provider.user_calls, before)
        status, _, body = self.request("/auth/session")
        self.assertEqual(status, 200)
        session = json.loads(body)
        self.assertEqual(set(session), {"authenticated", "csrf"})
        self.assertEqual(self.request("/auth/logout", "POST", {"csrf": session["csrf"]})[0], 303)
        self.assertEqual(self.request("/auth/session")[0], 401)
        self.assertEqual(self.request("/editor")[0], 303)
        self.assertEqual(self.provider.logout_calls, 1)

    def test_wrong_account_unverified_or_non_google_is_denied(self):
        users = [google_user("other@example.test"), google_user(), google_user(), google_user()]
        users[1]["identities"][0]["identity_data"]["email_verified"] = False
        users[2]["app_metadata"]["provider"] = "email"
        users[3]["email_confirmed_at"] = None
        for user in users:
            self.provider.user = user
            user["user_metadata"] = {"email": "owner@example.test", "provider": "google", "email_verified": True}
            self.assertEqual(self.request(self.start())[0], 403)
            self.assertNotIn("cg_session", self.cookies)
            self.assertEqual(self.request("/editor")[0], 303)

    def test_forged_session_callback_replay_and_login_csrf_rejected(self):
        self.cookies["cg_session"] = "forged-session"
        self.assertEqual(self.request("/auth/session")[0], 401)
        self.assertEqual(self.request("/auth/callback?code=forged")[0], 401)
        self.request("/auth/login")
        self.assertEqual(self.request("/auth/login", "POST", {"csrf": "wrong"})[0], 401)
        callback = self.start()
        self.assertEqual(self.request(callback)[0], 303)
        self.assertEqual(self.request(callback)[0], 401)
        # A code from a different PKCE flow does not establish a session.
        callback = self.start()
        self.request("/auth/login")
        flow = self.auth.flows[self.cookies["cg_login"]]
        self.auth.begin(self.cookies["cg_login"], flow["csrf"])
        self.assertEqual(self.request(callback)[0], 401)

    def test_refresh_expiry_revocation_and_upstream_outage_fail_closed(self):
        self.sign_in()
        session = self.auth.sessions[self.cookies["cg_session"]]
        session["expires"] = time.time() - 1
        self.assertEqual(self.request("/editor/note")[0], 200)
        self.assertEqual(self.provider.refresh_calls, 1)
        self.provider.offline = True
        self.assertEqual(self.request("/editor")[0], 503)
        self.provider.offline = False
        self.provider.revoked = True
        self.assertEqual(self.request("/auth/session")[0], 401)
        self.assertEqual(self.request("/editor")[0], 303)
        self.provider.revoked = False
        self.sign_in()
        self.auth.sessions[self.cookies["cg_session"]]["deadline"] = time.time() - 1
        self.assertEqual(self.request("/auth/session")[0], 401)

    def test_csrf_host_and_static_secret_boundaries(self):
        self.sign_in()
        for origin in (False, "null", "http://evil.example"):
            self.assertEqual(self.request("/auth/logout", "POST", {"csrf": "wrong"}, origin=origin)[0], 403)
        self.assertEqual(self.request("/auth/logout", "POST", {"csrf": "wrong"})[0], 403)
        self.assertEqual(self.request("/", host="evil.example")[0], 421)
        for path in ("/.env.local", "/.env.example", "/.git/config", "/server.py", "/auth.py", "/editor.html", "/src/app.js", "/node_modules/", "/%2eenv.local", "/content/../.env.local"):
            self.assertEqual(self.request(path)[0], 404, path)
        self.assertEqual(self.request("/style.css")[0], 200)
        for path in ("/script.js", "/content/entries.json", "/content/home.json"):
            status, _, body = self.request(path)
            self.assertEqual(status, 200)
            self.assertNotIn(self.auth.config.publishable_key, body)

    def test_r2_images_require_owner_and_csrf_and_keep_credentials_private(self):
        status, _, body = self.request("/media/config")
        self.assertEqual(status, 200)
        self.assertEqual(set(json.loads(body)), {"configured", "imageBaseURL", "maxImageBytes"})
        self.assertEqual(self.request("/media/image-upload", "POST", {"type":"image/png", "size":"128", "csrf":"forged"})[0], 401)
        self.sign_in()
        self.assertEqual(self.request("/media/image-upload", "POST", {"type":"image/png", "size":"128", "csrf":"wrong"})[0], 403)
        csrf = self.auth.sessions[self.cookies["cg_session"]]["csrf"]
        self.assertEqual(self.request("/media/image-upload", "POST", {"type":"image/png", "size":"128", "csrf":csrf}, origin="http://evil.example")[0], 403)

    def test_youtube_routes_require_owner_session_and_csrf(self):
        self.assertEqual(self.request("/youtube/status")[0], 401)
        self.assertEqual(self.request("/youtube/token", "POST", {"csrf": "forged"})[0], 401)
        self.sign_in()
        csrf = self.auth.sessions[self.cookies["cg_session"]]["csrf"]
        for path in ("/youtube/connect", "/youtube/token", "/youtube/video", "/youtube/disconnect"):
            self.assertEqual(self.request(path, "POST", {"csrf": "wrong"})[0], 403)
            self.assertEqual(self.request(path, "POST", {"csrf": csrf}, origin="http://evil.example")[0], 403)
        status, headers, content = self.request("/youtube/status")
        self.assertEqual(status, 200)
        self.assertFalse(json.loads(content)["connected"])
        self.assertNotIn("access_token", content)
        self.assertEqual(headers["Cache-Control"], "no-store")
        self.assertEqual(self.request("/youtube/token", "POST", {"csrf": csrf})[0], 409)
        self.assertEqual(self.request("/youtube/callback?state=forged&code=forged")[0], 400)

    def test_missing_configuration_locks_editor_and_return_path_cannot_escape(self):
        original = self.auth.config
        try:
            self.auth.config = replace(original, publishable_key="")
            self.assertEqual(self.request("/auth/login")[0], 503)
            self.assertEqual(self.request("/editor")[0], 303)
        finally:
            self.auth.config = original
        status, headers, _ = self.request(self.start("//evil.example/"))
        self.assertEqual(status, 303)
        self.assertEqual(headers["Location"], "/editor")

    def test_production_configuration_rejects_secrets_wildcards_and_nonlocal_site(self):
        for values in ({"SUPABASE_PUBLISHABLE_KEY": "sb_secret_not-real"}, {"OWNER_EMAIL_ALLOWLIST": "*@example.test"},
                       {"SUPABASE_URL": "http://example.test"}, {"APP_ORIGIN": "https://external.example"}):
            with patch.dict(os.environ, values, clear=True):
                with self.assertRaises(ValueError):
                    Config.from_env()


if __name__ == "__main__":
    unittest.main()
