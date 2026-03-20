""" Module to handle terminal commands """

import argparse

from typing import Callable

import argcomplete

from conlang_tools.common import consts, utils
from conlang_tools.lt_cli.lt_repl import ReplHandler
from conlang_tools.data_tools import data_utils, parse_german_lang_stats


class LtCLIHandler:
    """Class to handle temrinal interations"""

    def __init__(self):
        self.args = self.get_args()
        self.action = self.args.action
        self.handle_input()

    def handle_input(self) -> None:
        if self.action == "func":
            action: Callable = getattr(self, self.args.func)

            arg_count = get_args_count(action)
            if self.args.remaining and arg_count:
                action(*self.args.remaining)
            else:
                action()
        elif self.action == "cfg":
            args = vars(self.args)
            key = args.get("key")
            value = args.get("value")

            match self.args.cfg_action:
                case "set":
                    consts.CONFIG.set(key, value)
                case "get":
                    consts.CONFIG.get(key, True)
                case "del":
                    consts.CONFIG.delete(key)
                case "append":
                    consts.CONFIG.append_prop(key, value)
                case "list":
                    utils.pretty_print(consts.CONFIG.cfg)

    def get_args(self) -> argparse.Namespace:
        """Return the parsed arguments"""

        available_funcs = [
            key
            for key in dir(self)
            if callable(getattr(self, key))
            and key not in ["get_args", "handle_input"]
            and not key.startswith("__")
        ]
        parser = argparse.ArgumentParser(description="Conlang Tool")

        subparsers = parser.add_subparsers(dest="action")

        cfg_parser = subparsers.add_parser(
            "cfg", help="Modify/retrieve config settings"
        )

        cfg_subparsers = cfg_parser.add_subparsers(dest="cfg_action")

        cfg_shared_parser = argparse.ArgumentParser(add_help=False)
        cfg_shared_parser.add_argument(
            "key",
            type=str,
            help="Configuration key to get, set, or delete. Nested keys can be specified using dot notation.",
        ).completer = lambda **kwargs: consts.CONFIG.cfg.keys()

        # Subparser for getting a property
        cfg_subparsers.add_parser(
            "get", help="Get configuration", parents=[cfg_shared_parser]
        )

        # Subparser for setting a property
        cfg_set_parser = cfg_subparsers.add_parser(
            "set", help="Set configuration", parents=[cfg_shared_parser]
        )
        cfg_set_parser.add_argument(
            "value", type=str, help="Value to set the configuration key to"
        )

        # Subparser for appending a value to a list property
        cfg_append_parser = cfg_subparsers.add_parser(
            "append",
            help="Append to a list configuration",
            parents=[cfg_shared_parser],
        )
        cfg_append_parser.add_argument(
            "value", type=str, help="Value to append to the list"
        )

        # Subparser for deleting a property
        cfg_subparsers.add_parser(
            "del", help="Delete configuration", parents=[cfg_shared_parser]
        )

        # Subparser for listing configuration
        cfg_subparsers.add_parser("list", help="List configuration")

        func_parser = subparsers.add_parser(
            "func", help="Call a handler function by name"
        )
        func_parser.add_argument(
            "func",
            help="action to take",
            choices=available_funcs,
        )
        func_parser.add_argument(
            "remaining", nargs=argparse.REMAINDER, help="Remaining arguments"
        )

        argcomplete.autocomplete(parser)
        return parser.parse_args()

    def test(self) -> None:
        print("Hello world!!")

    def repl(self) -> None:
        repl = ReplHandler(title="ConLang Tools REPL")
        repl.run()

    def interactive(self, *import_keys) -> None:
        print("Interactive mode")
        repl = ReplHandler(title="ConLang Tools REPL")

        imports = {}

        for key in import_keys:
            import_item = globals().get(key)
            if import_item:
                imports[key] = import_item

        repl.interactive(
            data_utils=data_utils,
            parse_german_lang_stats=parse_german_lang_stats,
            **imports,
        )

    def german(self) -> None:
        data_utils.map_xsampa_to_graphemes()


def get_args_count(func: Callable) -> int:
    """Get the number of arguments for a function

    Args:
        func (Callable): Function to check

    Returns:
        int: Number of arguments
    """

    if not callable(func):
        return 0

    if hasattr(func, "__wrapped__"):
        actual_func = func.__wrapped__
    else:
        actual_func = func

    pos_args = actual_func.__code__.co_posonlyargcount
    kw_args = actual_func.__code__.co_kwonlyargcount
    args = actual_func.__code__.co_argcount
    return pos_args + kw_args + args


def main():
    """Main entry point for the YAMS application."""
    LtCLIHandler()


if __name__ == "__main__":
    main()
