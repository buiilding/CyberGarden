"""Loopback-only garden server with validated, owner-only editor access."""

from functools import partial
import html
import hmac
from http.cookies import CookieError, SimpleCookie
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
import json
from pathlib import Path
import re
from urllib.parse import parse_qs, unquote, urlencode, urlsplit

from auth import AuthError, AuthService, Config, EDITOR_ROUTE, FLOW_COOKIE, FLOW_SECONDS, SESSION_COOKIE, SESSION_SECONDS, load_local_env

from youtube_upload import YouTubeService, YouTubeError

ROOT = Path(__file__).resolve().parent
PUBLIC_ROUTE = re.compile(r"/|/pages/?|/page/[A-Za-z0-9_-]+/?")
STATIC = {"/style.css": "text/css", "/script.js": "text/javascript", "/sample.svg": "image/svg+xml",
          "/content/entries.json": "application/json", "/content/home.json": "application/json"}


class GardenHandler(BaseHTTPRequestHandler):
    def __init__(self, *args, auth, youtube, **kwargs):
        self.auth = auth
        self.youtube = youtube
        super().__init__(*args, **kwargs)

    def log_message(self, format, *args):
        # Callback queries contain one-time codes; never put them in logs.
        if not unquote(urlsplit(self.path).path).startswith("/auth/"):
            super().log_message(format, *args)

    def log_request(self, code="-", size="-"):
        self.log_message('"%s %s" %s', self.command, urlsplit(self.path).path, code)

    def reply(self, status, content="", content_type="text/html; charset=utf-8", headers=()):
        data = content.encode() if isinstance(content, str) else content
        self.send_response(status)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(data)))
        self.send_header("Cache-Control", "no-store")
        # Native same-origin form POSTs need their real Origin for CSRF checks.
        # no-referrer would make Chrome send Origin: null. Callback codes still
        # receive no-referrer so the one-time code cannot become a Referer.
        callback = unquote(urlsplit(self.path).path) in {"/auth/callback", "/youtube/callback"}
        self.send_header("Referrer-Policy", "no-referrer" if callback else "same-origin" if urlsplit(self.path).path.startswith("/auth/") else "strict-origin-when-cross-origin")
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("X-Frame-Options", "DENY")
        self.send_header("Content-Security-Policy", "frame-ancestors 'none'; base-uri 'self'")
        for name, value in headers:
            self.send_header(name, value)
        self.end_headers()
        if self.command != "HEAD":
            self.wfile.write(data)

    def cookie_header(self, name, value, seconds):
        jar = SimpleCookie()
        jar[name] = value
        jar[name]["path"] = "/"
        jar[name]["httponly"] = True
        jar[name]["samesite"] = "Lax"
        jar[name]["max-age"] = seconds
        # Loopback HTTP only. Never create a Domain cookie.
        return "Set-Cookie", jar[name].OutputString()

    def cookie(self, name):
        try:
            jar = SimpleCookie(self.headers.get("Cookie", ""))
            return jar[name].value if name in jar else ""
        except CookieError:
            return ""

    def redirect(self, target, headers=()):
        self.reply(303, headers=[("Location", target), *headers])

    def error_page(self, status, message):
        self.reply(status, self.page("Editor sign-in", f'<p>{html.escape(message)}</p><p><a href="/auth/login">Try sign-in again</a> · <a href="/">View garden</a></p>'))

    def page(self, title, content):
        return f'<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{title} — Peter</title><link rel="stylesheet" href="/style.css"><main class="auth-page"><a class="site-name" href="/">Peter</a><h1>{title}</h1>{content}</main></html>'

    def valid_host(self):
        return self.headers.get("Host") == urlsplit(self.auth.config.origin).netloc

    def do_HEAD(self):
        self.do_GET()

    def do_GET(self):
        if not self.valid_host():
            self.reply(421, "Use the APP_ORIGIN address configured for this local garden.", "text/plain")
            return
        path = unquote(urlsplit(self.path).path)
        query = parse_qs(urlsplit(self.path).query)
        if path == "/youtube/callback":
            try:
                session_id = self.cookie(SESSION_COOKIE)
                session = self.auth.validate(session_id)
                self.youtube.finish(session_id, session, query.get("state", [""])[0], query.get("code", [""])[0])
                self.redirect("/youtube/connected")
            except (AuthError, YouTubeError) as error:
                self.reply(getattr(error, "status", 400), self.page("YouTube connection", '<p>Connection was not completed. Close this window and try connecting YouTube again in the editor.</p>'))
        elif path == "/youtube/connected":
            self.reply(200, self.page("YouTube connected", '<p>Connected. You can close this window and return to the upload dialog.</p>'))
        elif path == "/youtube/status":
            try:
                session = self.auth.validate(self.cookie(SESSION_COOKIE))
                connection = session.get("youtube", {})
                self.reply(200, json.dumps({"configured": self.youtube.configured, "connected": bool(connection), "channel": connection.get("channel_title", "")}), "application/json")
            except AuthError as error:
                self.reply(error.status, '{"error":"Sign in to the editor again."}', "application/json")
        elif path == "/auth/login":
            if not self.auth.config.configured:
                self.error_page(503, "Google sign-in needs local configuration. Set SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, and OWNER_EMAIL_ALLOWLIST in .env.local, then restart npm start. See README.md.")
                return
            with self.auth.lock:
                self.auth.flows.pop(self.cookie(FLOW_COOKIE), None)
            try:
                flow, csrf = self.auth.new_flow(query.get("next", ["/editor"])[0])
            except AuthError:
                self.error_page(503, "Sign-in is temporarily unavailable. Try again shortly.")
                return
            form = f'<p>Sign in with the Google account allowed to edit this garden.</p><form method="post" action="/auth/login"><input type="hidden" name="csrf" value="{csrf}"><button type="submit">Continue with Google</button></form><p><a href="/">View garden</a></p>'
            self.reply(200, self.page("Editor sign-in", form), headers=[self.cookie_header(FLOW_COOKIE, flow, FLOW_SECONDS)])
        elif path == "/auth/callback":
            try:
                session, target = self.auth.finish(self.cookie(FLOW_COOKIE), query.get("code", [""])[0])
                self.redirect(target, [self.cookie_header(SESSION_COOKIE, session, SESSION_SECONDS), self.cookie_header(FLOW_COOKIE, "", 0)])
            except AuthError as error:
                self.error_page(error.status, "Sign-in could not be completed. Use the allowed Google account and start again. If it persists, check the Supabase Google provider and redirect settings.")
        elif path == "/auth/session":
            try:
                session = self.auth.validate(self.cookie(SESSION_COOKIE))
                self.reply(200, json.dumps({"authenticated": True, "csrf": session["csrf"]}), "application/json")
            except AuthError as error:
                self.reply(error.status, '{"authenticated":false}', "application/json")
        elif EDITOR_ROUTE.fullmatch(path):
            try:
                self.auth.validate(self.cookie(SESSION_COOKIE))
            except AuthError as error:
                if error.status == 503:
                    self.error_page(503, "Editor access could not be validated. Check the local configuration or connection and try again.")
                else:
                    self.redirect("/auth/login?" + urlencode({"next": path}))
                return
            document = (ROOT / "index.html").read_text().replace("<!-- EDITOR -->", (ROOT / "editor.html").read_text())
            self.reply(200, document)
        elif PUBLIC_ROUTE.fullmatch(path) or path == "/index.html":
            self.reply(200, (ROOT / "index.html").read_text().replace("<!-- EDITOR -->", ""))
        elif path in STATIC:
            self.reply(200, (ROOT / path.lstrip("/")).read_bytes(), STATIC[path])
        else:
            # No listings, source, .env, Git, caches, or direct editor template.
            self.reply(404, "Not found", "text/plain")

    def do_POST(self):
        if not self.valid_host() or self.headers.get("Origin") != self.auth.config.origin:
            self.reply(403, "Request origin is not allowed.", "text/plain")
            return
        if self.headers.get("Content-Type", "").split(";", 1)[0] != "application/x-www-form-urlencoded":
            self.reply(415, "Expected a form.", "text/plain")
            return
        try:
            length = int(self.headers.get("Content-Length", "0"))
            if length < 0 or length > 8192 or self.headers.get("Transfer-Encoding"):
                raise ValueError()
            form = parse_qs(self.rfile.read(length).decode())
        except (ValueError, UnicodeError):
            self.reply(400, "Invalid form.", "text/plain")
            return
        path = urlsplit(self.path).path
        try:
            if path.startswith("/youtube/"):
                session_id = self.cookie(SESSION_COOKIE)
                session = self.auth.validate(session_id)
                if not hmac.compare_digest(session["csrf"].encode(), form.get("csrf", [""])[0].encode()):
                    raise AuthError(403)
                if path == "/youtube/connect":
                    result = {"url": self.youtube.begin(session_id)}
                elif path == "/youtube/token":
                    result = {"access_token": self.youtube.access(session, force=form.get("refresh", [""])[0] == "true")}
                elif path == "/youtube/video":
                    result = self.youtube.video(session, form.get("id", [""])[0])
                elif path == "/youtube/disconnect":
                    session.pop("youtube", None)
                    result = {"connected": False}
                else:
                    self.reply(404, "Not found", "text/plain")
                    return
                self.reply(200, json.dumps(result), "application/json")
            elif path == "/auth/login":
                self.redirect(self.auth.begin(self.cookie(FLOW_COOKIE), form.get("csrf", [""])[0]))
            elif path == "/auth/logout":
                self.auth.logout(self.cookie(SESSION_COOKIE), form.get("csrf", [""])[0])
                self.redirect("/", [self.cookie_header(SESSION_COOKIE, "", 0)])
            else:
                self.reply(404, "Not found", "text/plain")
        except YouTubeError as error:
            self.reply(error.status, json.dumps({"error": str(error)}), "application/json")
        except AuthError as error:
            if path.startswith("/youtube/"):
                self.reply(error.status, '{"error":"Sign in to the editor again."}', "application/json")
                return
            self.error_page(error.status, "This sign-in request expired or was not allowed. Start sign-in again.")


def make_server(config, address=("127.0.0.1", 4183)):
    return ThreadingHTTPServer(address, partial(GardenHandler, auth=AuthService(config), youtube=YouTubeService(config.origin)))


if __name__ == "__main__":
    load_local_env(ROOT)
    config = Config.from_env()
    with make_server(config) as server:
        print(f"CyberGarden: {config.origin}", flush=True)
        print("Editor authentication configured." if config.configured else "Editor locked: configure .env.local (see README.md).", flush=True)
        try:
            server.serve_forever()
        except KeyboardInterrupt:
            pass
