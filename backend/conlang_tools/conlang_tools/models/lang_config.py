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

    Module Name: lang_config
    Description: Base configuration for a language
    Author: Joseph Bochinski
    Date: 2024-10-23


#######################################################################
"""

# region Imports
from collections import defaultdict

from conlang_tools.models.base_element import BaseElement

# endregion Imports


# region Constants

# endregion Constants


# region Classes
class LanguageConfig(BaseElement):
    """Base configuration for a ConLang"""

    def __init__(self, **kwargs):
        self.name: str = ""
        # self.language_family: str = ""
        self.lang_config_id: int = -1
        self.phonetic_inventory: dict[str, str] = defaultdict(str)
        self.othography_categories: dict[str, list[str]] = defaultdict(list)
        self.orth_syllables: dict[str, int] = defaultdict(int)
        self.grapheme_lookup: dict[str, str] = defaultdict(str)
        self.debug: bool = False

        super().__init__(**kwargs)

        if not self.grapheme_lookup:
            self.grapheme_lookup = {
                v: k for k, v in self.phonetic_inventory.items()
            }

    def get_syllable_pairs(self) -> tuple[list[str], list[int]]:
        """Get the syllable pairs from the orthographic categories

        Returns:
            tuple[list[str], list[int]]: The syllable pairs
        """
        return list(self.orth_syllables.keys()), list(self.orth_syllables.values())


# endregion Classes


# region Functions

# endregion Functions
