from __future__ import annotations

import mimetypes
import sys
import webbrowser
from argparse import ArgumentParser
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path


ROOT = Path(__file__).resolve().parent
WEB_DIR = ROOT / "web"
DEFAULT_HOST = "127.0.0.1"
DEFAULT_PORT = 8787


class StaticHandler(SimpleHTTPRequestHandler):
    def do_GET(self) -> None:
        requested_path = self.path.split("?", 1)[0]
        if requested_path == "/":
            self.serve_file(WEB_DIR / "index.html", "text/html; charset=utf-8")
            return

        requested = (WEB_DIR / requested_path.lstrip("/")).resolve()
        if requested.is_file() and WEB_DIR in requested.parents:
            content_type = mimetypes.guess_type(str(requested))[0] or "application/octet-stream"
            if content_type.startswith("text/") or content_type == "application/javascript":
                content_type = f"{content_type}; charset=utf-8"
            self.serve_file(requested, content_type)
            return

        self.send_error(404)

    def serve_file(self, path: Path, content_type: str) -> None:
        data = path.read_bytes()
        self.send_response(200)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def log_message(self, format: str, *args: object) -> None:
        print(f"[web] {self.address_string()} - {format % args}")


def main() -> int:
    parser = ArgumentParser()
    parser.add_argument("--host", default=DEFAULT_HOST)
    parser.add_argument("--port", type=int, default=DEFAULT_PORT)
    parser.add_argument("--no-browser", action="store_true")
    args = parser.parse_args()

    server = ThreadingHTTPServer((args.host, args.port), StaticHandler)
    shown_host = "127.0.0.1" if args.host in {"0.0.0.0", ""} else args.host
    url = f"http://{shown_host}:{args.port}/"
    print(f"V-LOG static web app: {url}")
    if args.host == "0.0.0.0":
        print(f"LAN mode: open http://<this-pc-ip>:{args.port}/ from another device on the same network.")
    if not args.no_browser:
        webbrowser.open(url)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("Stopping server.")
    finally:
        server.server_close()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
