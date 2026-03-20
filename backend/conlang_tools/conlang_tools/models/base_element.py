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

    Module Name: base_element
    Description: Root class to be inherited by all conlang_tools
    elements
    Author: Joseph Bochinski
    Date: 2024-10-23


#######################################################################
"""

# region Imports
from __future__ import annotations

import json

from typing import Any, Callable, TypeVar

from caseconverter import snakecase, camelcase

from conlang_tools.common import utils

# endregion Imports


# region Constants
T = TypeVar("T")
ClassType = Callable[[dict], T]

# endregion Constants


# region Classes
class BaseElement:
    """Root class to be inherited by all conlang_tools elements"""

    def __init__(self, **kwargs):
        """Initialize the BaseElement class

        Args:
            kwargs (dict): The keyword arguments to initialize the
                element with
        """
        for key, value in kwargs.items():
            setattr(self, key, value)

    def to_dict(self) -> dict:
        """Return the element as a dictionary

        Returns:
            dict: The element as a dictionary
        """
        self_dict = {}

        def parse_value(value):
            if hasattr(value, "to_dict"):
                return value.to_dict()
            elif isinstance(value, list):
                return [parse_value(v) for v in value]
            elif isinstance(value, dict):
                return {k: parse_value(v) for k, v in value.items()}
            else:
                return value

        for key, value in vars(self).items():
            if key.startswith("_"):
                continue

            self_dict[key] = parse_value(value)

        return self_dict

    def to_typescript(self) -> dict:
        """Return the element with TypeScript property formatting

        Returns:
            dict: The element with TypeScript property formatting
        """
        self_dict = {}

        def parse_value(value):
            if hasattr(value, "to_typescript"):
                return value.to_typescript()
            elif isinstance(value, list):
                return [parse_value(v) for v in value]
            elif isinstance(value, dict):
                return {camelcase(k): parse_value(v) for k, v in value.items()}
            else:
                return value

        for key, value in vars(self).items():
            if key.startswith("_"):
                continue

            self_dict[camelcase(key)] = parse_value(value)

        return self_dict

    @staticmethod
    def load_from_file(file_path: str, class_type: Callable[[dict], T] = None) -> T:
        """Instantiate an element from a data file

        Args:
            file_path (str): The path to the data file
            class_type (ClassType, optional): The class type to instantiate
            the element as. Defaults to BaseElement.

        Returns:
            T: The instantiated element
        """
        class_type = class_type or BaseElement
        data = utils.read_file(file_path)
        return class_type(**data)

    def save_to_file(
        self, file_path: str | None = None, as_json: bool = False
    ) -> None:
        """Save the element to a data file

        Args:
            file_path (str | None, optional): The path to save the data
                file to. If None, the element will be saved to a file
                named after the element. Defaults to None.
            as_json (bool, optional): Whether to save the file as JSON.
                Defaults to True.
        """
        ext = "json" if as_json else "yaml"
        if hasattr(self, "out_path"):
            file_path = self.out_path

        file_path = (
            utils.replace_ext(file_path, ext)
            if file_path
            else f"{snakecase(self.__class__.__name__)}.{ext}"
        )
        data = self.to_dict()
        utils.write_data_file(file_path, data)

    def as_type(self, class_type: ClassType) -> T:
        """Return the element as an element of the specified class type

        Args:
            class_type (ClassType): The class type to return the element as

        Returns:
            T: The element as an element of the specified class type
        """
        return class_type(**self.to_dict())

    def __str__(self) -> str:
        """Return the string representation of the element

        Returns:
            str: The string representation of the element
        """
        return json.dumps(self.to_dict(), indent=4)

    def __repr__(self) -> str:
        """Return the string representation of the element

        Returns:
            str: The string representation of the element
        """
        return self.__str__()

    def __eq__(self, other: object) -> bool:
        """Check if two elements are equal

        Args:
            other (object): The other element to compare to

        Returns:
            bool: True if the elements are equal, False otherwise
        """
        if not isinstance(other, BaseElement):
            return False

        return self.to_dict() == other.to_dict()

    def __ne__(self, other: object) -> bool:
        """Check if two elements are not equal

        Args:
            other (object): The other element to compare to

        Returns:
            bool: True if the elements are not equal, False otherwise
        """
        return not self.__eq__(other)

    def __hash__(self) -> int:
        """Return the hash of the element

        Returns:
            int: The hash of the element
        """
        return hash(self.to_dict())


# endregion Classes


# region Functions

# endregion Functions
