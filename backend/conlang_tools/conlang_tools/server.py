""" """  # bsd_backend/services/web_server.py

from gevent import monkey

# from magmek_backend.logcleaner import appdata

# done here to prevent conflicts with other packages like redis that are
# imported implicitly through the core package
monkey.patch_all()

import argparse
import gunicorn.glogging

from argcomplete import autocomplete
from gunicorn.app.base import BaseApplication


# from magmek_backend import consts
from conlang_tools.common import consts
from conlang_tools.app import get_app

# logconfig_dict = CONFIG.get("log-configs.rramps")


class GunicornApp(BaseApplication):
    def __init__(self, application, options=None):
        self.options = options or {}
        self.application = application
        super().__init__()

    def load_config(self) -> None:
        for key, value in self.options.items():
            if key in self.cfg.settings and value is not None:
                self.cfg.set(key.lower(), value)

    def load(self):
        return self.application


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--local", "-l", action="store_true", help="Run the server in local mode"
    )

    parser.add_argument(
        "--force-embed",
        "-f",
        action="store_true",
        help="If true, force embedding of default data",
    )

    autocomplete(parser)
    args = parser.parse_args()

    # appdata.embed_base_data(args.force_embed)

    bind = "unix:/run/gunicorn/conlang-server.sock"
    if args.local:
        consts.GlobalConfig.local = True
        bind = "127.0.0.1:5000"
        print(f"in local mode, bind: {bind}")

    options = {
        "bind": bind,
        "workers": 4,
        "worker_class": "gevent",
        "loglevel": "info",
        "keepalive": 10,
        "max_requests": 0,
        "preload_app": False,
        "umask": 0o007,
        "logger_class": "gunicorn.glogging.Logger",
    }

    GunicornApp(get_app(), options).run()


if __name__ == "__main__":
    main()
