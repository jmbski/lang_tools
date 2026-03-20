""" Module containing code for interacting with config files """

import os

from typing import Any

import yaml

from ..common.utils import set_nested, get_nested, delete_nested

CFG_PATH = os.path.expanduser("~/.config/langtools.yaml")


def write_yaml(path: str, content: dict) -> None:
    """Writes YAML content to file

    Args:
        path (str): Path to the yaml file
        content (dict): Content to write
    """

    with open(path, "w", encoding="UTF-8") as fs:
        yaml.safe_dump(content, fs)


def check_file(path: str, default: Any = "") -> None:
    """Checks if a config file exists and if not, creates a default one

    Args:
        path (str): Path to the config file
        default (Any): Default content to write

    Returns:
        None
    """

    if not os.path.exists(path):
        _, ext = os.path.splitext(path)

        if ext.lower() in [".yaml", ".yml"]:
            write_yaml(path, default)


def read_yaml_file(path: str) -> dict:
    """Read a YAML file

    Args:
        path (str): Path to the file

    Returns:
        dict: The YAML data
    """

    with open(path, "r", encoding="UTF-8") as fs:
        return yaml.safe_load(fs)


class ConfigHandler:
    """Class to manage config settings"""

    def __init__(self) -> None:
        check_file(CFG_PATH, {})
        self.cfg: dict = read_yaml_file(CFG_PATH)
        self.db_path = self.cfg.get("db_path")
        self.url_origins = self.cfg.get("url_origins", "http://localhost:4200")
        self.data_dir: str = self.cfg.get("data_dir", "")

    def set(self, key: str | list[str], value: Any) -> None:
        """Sets a value in the config and saves the settings to file

        Args:
            key (str | list[str]): Key path to the value to update
            value (Any): Value to update with
        """

        set_nested(self.cfg, key, value)

        write_yaml(CFG_PATH, self.cfg)

    def delete(self, key: str | list[str]) -> None:
        """Deletes a value from the config

        Args:
            key (str | list[str]): Key path to the value to remove
        """

        delete_nested(self.cfg, key)
        write_yaml(CFG_PATH, self.cfg)

    def get(self, key: str | list[str], to_console: bool = False) -> Any:
        """Retrieves a value from the config file and optionally prints
            it to the console

        Args:
            key (str | list[str]): Key path to the value
            to_console (bool, optional): Whether to print to the console.
                Defaults to False.

        Returns:
            Any: The requested value
        """

        value = get_nested(self.cfg, key)

        if to_console:
            print(f"Key `{key}` = {value}")

        return value

    def append_prop(self, key: list[str] | str, value: str) -> None:
        """Append to a list in the config"""

        if key:
            value = get_nested(self.cfg, key)
            if not isinstance(value, list):
                print(f"{key} is not a list")
                return
            value.append(value)
            write_yaml(CFG_PATH, self.cfg)
            print(f"Appended {value} to {key}")
