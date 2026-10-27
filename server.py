"""Local static server with entry points for the garden's browser routes."""

from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import re
from urllib.parse import urlsplit


ROOT = Path(__file__).resolve().parent
APP_ROUTE = re.compile(r"/(?:pages|editor)/?|/(?:page|editor)/[A-Za-z0-9_-]+/?")


class GardenHandler(SimpleHTTPRequestHandler):
    def send_head(self):
        if APP_ROUTE.fullmatch(urlsplit(self.path).path):
            self.path = "/index.html"
        return super().send_head()


if __name__ == "__main__":
    handler = partial(GardenHandler, directory=str(ROOT))
    with ThreadingHTTPServer(("127.0.0.1", 4183), handler) as server:
        print("CyberGarden: http://localhost:4183", flush=True)
        try:
            server.serve_forever()
        except KeyboardInterrupt:
            pass
