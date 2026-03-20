"""Copyright 2024 Joseph Bochinski

Permission is hereby granted, free of charge, to any person obtaining a
copy of this software and associated documentation files (the
“Software”), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be included
in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS
OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

#######################################################################

    Module Name: utils
    Description: Module containing various general utility functions not
    specific to any one package
    Author: Joseph Bochinski
    Date: 2024-10-23


#######################################################################
"""

# region Imports
import csv
import itertools
import json
import os

from dataclasses import dataclass
from random import random
from typing import Any, TypeVar

import yaml


# endregion Imports
class UtilConsts:
    """Constant values for utility functions"""

    ENCODING: str = "UTF-8"


# region Constants
T = TypeVar("T")

# endregion Constants


# region Classes

# endregion Classes


# region Functions


def rand_int(start: int = 0, end: int = 100) -> int:
    """Generate a random integer between the start and end values

    Args:
        start (int, optional): The starting value of the range. Defaults to 0.
        end (int, optional): The ending value of the range. Defaults to 100.

    Returns:
        int: The random integer
    """
    return int(random() * (end - start + 1)) + start


# pylint: disable=unused-argument
def flatten_list(items: list[Any], as_type: T = str) -> list[T]:
    """Flattens a list with any nested lists into a single list

    Args:
        items (list[Any]): The list to flatten
        as_type (T, optional): The type to cast the items to. Defaults
            to str.

    Returns:
        list[Any]: The flattened list
    """

    flat_list = []
    for item in items:
        if isinstance(item, list):
            flat_list.extend(flatten_list(item))
        else:
            flat_list.append(item)
    return flat_list


def read_file(
    path: str, mode: str = "r", encoding: str = "UTF-8", as_lines: bool = False
) -> str | dict | list:
    """Read data from a file

    Args:
        path (str): The path to the file
        mode (str, optional): IO mode to use. Defaults to "r".
        encoding (str, optional): Encoding format to use.
            Defaults to "UTF-8".
        as_lines (bool, optional): If reading a regular text file,
            True will return the value of readlines() instead of read().
            Defaults to False.

    Returns:
        str | dict | list: The data read from the file
    """

    _, ext = os.path.splitext(path)

    with open(path, mode, encoding=encoding) as fs:
        match ext.lower():
            case ".yaml" | ".yml":
                return yaml.safe_load(fs)
            case ".json":
                return json.load(fs)
            case ".csv":
                return [row for row in csv.reader(fs)]
            case _:
                if as_lines:
                    return fs.readlines()
                else:
                    return fs.read()


def write_data_file(file_path: str, data: Any):
    """Write data to a file

    Args:
        file_path (str): The path to the file to write to
        data (Any): The data to write to the file
    """

    with open(file_path, "w", encoding=UtilConsts.ENCODING) as file:
        if file_path.endswith(".json"):
            json.dump(data, file, indent=4)
        elif file_path.endswith(".yaml"):
            yaml.safe_dump(data, file)
        else:
            file.write(data)


def get_file_ext(file_path: str) -> str:
    """Get the file extension from a file path

    Args:
        file_path (str): The file path

    Returns:
        str: The file extension
    """
    return file_path.split(".")[-1]


def replace_ext(file_path: str, ext: str) -> str:
    """Replace the file extension in a file path

    Args:
        file_path (str): The file path
        ext (str): The new file extension

    Returns:
        str: The file path with the new extension
    """
    return ".".join(file_path.split(".")[:-1]) + f".{ext}"


def get_nested(
    obj: dict | list, path: list[str] | str, default_val: Any = None
) -> Any:
    """Get a nested value from a dictionary or list

    Args:
        obj (dict | list): The object to get the value from
        path (list[str] | str): The path to the value
        default_val (Any, optional): The default value to return if the path is not found.
            Defaults to None.

    Returns:
        Any: The value at the path or the default value
    """

    if isinstance(path, str):
        path = path.split(".")

    if len(path) == 1:
        result = None
        if isinstance(obj, dict):
            result = obj.get(path[0], default_val)

        elif isinstance(obj, list) and path[0].isdigit():
            idx = int(path[0])
            item = None
            if idx < len(obj):
                item = obj[idx]
            if item is None:
                item = default_val

            result = item
        return result

    key = path.pop(0)
    if isinstance(obj, list) and key.isdigit():
        if int(key) < len(obj):
            return get_nested(obj[int(key)], path, default_val)
        return default_val
    if key not in obj:
        return default_val
    return get_nested(obj[key], path, default_val)


# pylint: enable=unused-argument


def debug_print(*args):
    """Print debug statements with a newline before and after"""

    strings = list(args)
    strings.insert(0, "\n")
    strings.append("\n")
    print(*strings)


def pretty_print(obj: any) -> None:
    """Prints a JSON serializable object with indentation"""

    print(json.dumps(obj, indent=4))


@dataclass
class SetNestedOptions:
    """Options for the set_nested function"""

    def __init__(self, debug: bool = False, create_lists: bool = False) -> None:

        self.debug: bool = debug
        self.create_lists: bool = create_lists


def _set_next_append(
    obj: list,
    path: list[str],
    key: str | int,
    value: Any,
    debug: bool = False,
    create_lists: bool = True,
) -> None:
    """Set a value in a nested object when the index is out of bounds

    Args:
        obj (list): Object to set the value in
        path (list[str]): Path to the value
        key (str | int): Key to set the value at
        value (Any): Value to set
        debug (bool, optional): Flag to enable debug statements. Defaults to False.
        create_lists (bool, optional): Flag to set whether to create a list or. Defaults to True.
    """
    if debug:
        debug_print("out of bounds", "inserting new value", f"path[0] = {path[0]}")

    if path[0].isdigit() and create_lists:
        obj.insert(int(key), [])
    else:
        obj.insert(int(key), {})

    if debug:
        debug_print("blank inserted", obj)

    set_nested(obj[-1], path, value, debug, create_lists)


def _set_next_list_item(
    obj: list,
    path: list[str],
    key: str | int,
    value: Any,
    debug: bool = False,
    create_lists: bool = True,
) -> None:
    """Iterate through the next item in a list or dictionary

    Args:
        obj (list): Object to set the value in
        path (list[str]): Path to the value
        key (str | int): Key to set the value at
        value (Any): Value to set
        debug (bool, optional): Flag to enable debug statements. Defaults to False.
        create_lists (bool, optional): Flag to set whether to create a list or. Defaults to True.
    """

    sub = obj[int(key)]
    if not sub or not isinstance(sub, (dict, list)):
        if debug:
            debug_print("sub is None or not an object", "creating new sub")

        if path[0].isdigit() and create_lists:
            obj[int(key)] = []
        else:
            obj[int(key)] = {}

    set_nested(obj[int(key)], path, value, debug, create_lists)


def _set_final_prop(obj: dict | list, path: list[str], value: Any) -> None:
    """Set a value in a nested object at the final path

    Args:
        obj (dict | list): Object to set the value in
        path (list[str]): Path to the value
        value (Any): Value to set
    """

    if isinstance(obj, dict):
        obj[path[0]] = value
    elif isinstance(obj, list) and path[0].isdigit():
        if int(path[0]) < len(obj):
            obj[int(path[0])] = value
        else:
            obj.append(value)


def _set_next_nested(
    obj: dict | list,
    path: list[str],
    value: Any,
    key: str | int,
    debug: bool = False,
    create_lists: bool = True,
) -> None:
    """Set a value in a nested object

    Args:
        obj (dict | list): Object to set the value in
        path (list[str]): Path to the value
        value (Any): Value to set
        key (str | int): Key to set the value at
        debug (bool, optional): Flag to enable debug statements. Defaults to False.
        create_lists (bool, optional): Flag to set whether to create a list or. Defaults to True.
    """

    sub = obj.get(key)

    if debug:
        debug_print("obj is dict", "sub:", sub)

    if not sub or not isinstance(sub, (dict, list)):
        if debug:
            debug_print("sub is None or not an object", "creating new sub")

        if path[0].isdigit() and create_lists:
            obj[key] = []
        else:
            obj[key] = {}

        if debug:
            debug_print("new sub created", obj)

    set_nested(obj.get(key), path, value, debug, create_lists)


def set_nested(
    obj: dict | list,
    path: list[str] | str,
    value: Any,
    debug: bool = False,
    create_lists: bool = True,
) -> None:
    """Set a nested value in a dictionary or list

    Args:
        obj (dict | list): The object to set the value in
        path (list[str] | str): The path to the value
        value (Any): The value to set
        debug (bool, optional): Flag to enable debug statements. Defaults to False.
        create_lists (bool, optional): Flag to set whether to create a list or
            a dict when the path fragment is a number. Defaults to True.
    """

    if isinstance(path, str):
        path = path.split(".")

    if debug:
        debug_print("starting function")
        pretty_print({"obj": obj, "path": path, "value": value})

    if len(path) == 1:
        _set_final_prop(obj, path, value)
    else:
        key = path.pop(0)

        if debug:
            debug_print("key", key)

        if isinstance(obj, list) and key.isdigit():  # true
            if debug:
                debug_print("obj is list", "key < len", int(key) < len(obj))

            if int(key) < len(obj):
                _set_next_list_item(
                    obj,
                    path,
                    key,
                    value,
                    create_lists,
                )
            else:
                _set_next_append(
                    obj,
                    path,
                    key,
                    value,
                    create_lists,
                )
        elif isinstance(obj, dict):
            _set_next_nested(obj, path, value, key, debug, create_lists)


def delete_nested(obj: dict | list, path: list[str] | str) -> None:
    """Delete a nested value from a dictionary or list

    Args:
        obj (dict | list): The object to delete the value from
        path (list[str] | str): The path to the value
    """

    if isinstance(path, str):
        path = path.split(".")

    if len(path) == 1:
        if isinstance(obj, dict):
            obj.pop(path[0], None)
        elif isinstance(obj, list) and path[0].isdigit():
            idx = int(path[0])
            if idx < len(obj):
                obj.pop(idx)
    else:
        key = path.pop(0)
        if isinstance(obj, list) and key.isdigit():
            if int(key) < len(obj):
                delete_nested(obj[int(key)], path)
        elif key in obj:
            delete_nested(obj[key], path)


def combine_items(items: list) -> list:
    """Retrieve all combinations of items from size 1 to len(items)

    Args:
        items (list): Items to retrieve combinations of

    Returns:
        list: all combinations
    """

    new_set = set()

    for i in range(len(items)):
        new_set.update(itertools.combinations(items, i + 1))

    combs = list(new_set)
    combs = ["".join(list(c)) for c in combs]
    return combs


def get_str_combinations(text: str) -> list[str]:
    """Return all of the sequential combinations of characters in a string

    Args:
        text (str): Text to parse

    Returns:
        list[str]: Sequential combinations. E.g., "abc" -> ["a","b","ab","bc","abc"]
    """

    combinations = [c for c in combine_items(list(text)) if c in text]
    combinations.sort(key=len, reverse=True)
    groups: list[list[str]] = []
    group_iters = itertools.groupby(combinations, key=len)

    for _, g in group_iters:
        groups.append(list(g))

    sorted_combinations = []

    for group in groups:
        group.sort(key=text.index)
        sorted_combinations.extend(group)

    return sorted_combinations


def split_on_str(text: str, term: str) -> list[str]:
    parts = []
    while text:
        pre, tgt, post = text.partition(term)
        if pre:
            parts.append(pre)
        if tgt:
            parts.append(tgt)
        text = post
    return parts


def flatten(list_of_lists: list) -> list:
    "Flatten one level of nesting."
    return list(itertools.chain.from_iterable(list_of_lists))


def split_str_by_terms(text: str | list[str], terms: list[str]) -> list[str]:
    parts = text if isinstance(text, list) else [text]
    for term in terms:
        parts = flatten([split_on_str(part, term) for part in parts])

    return parts


def try_float(cell: str) -> float | str:
    value = cell
    try:
        if "." in cell or "e" in cell:
            value = float(cell)
        else:
            value = int(cell)
    except ValueError:
        pass

    return value


# endregion Functions
