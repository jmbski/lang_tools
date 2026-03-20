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

    Module Name: consts
    Description: Module containing constant values usable by other
    packages/modules
    Author: Joseph Bochinski
    Date: 2024-10-23


#######################################################################
"""

# region Imports
import json
import os

from conlang_tools.config import ConfigHandler

# endregion Imports


# region Constants
CONFIG = ConfigHandler()

ENCODING: str = "UTF-8"

LJ_PATH = os.path.join(CONFIG.data_dir, "leipzig-jakarta.json")
if os.path.exists(LJ_PATH):
    with open(LJ_PATH, "r", encoding=ENCODING) as _fs:
        LJ_WORDS = json.load(_fs)
else:
    LJ_WORDS = []

SWADESH_PATH = os.path.join(CONFIG.data_dir, "swadesh_en.json")
if os.path.exists(SWADESH_PATH):
    with open(SWADESH_PATH, "r", encoding=ENCODING) as _fs:
        SWADESH_WORDS = json.load(_fs)
else:
    SWADESH_WORDS = []

COMBINED = list(set(LJ_WORDS + SWADESH_WORDS))

NLTK_DATA_PATH = os.environ.get("NLTK_DATA", "/home/magmek/nltk_data")
NLTK_PACKAGES = ["wordnet", "wordnet2022"]
# endregion Constants


# region Classes


class GlobalConfig:
    local: bool = True


# endregion Classes


# region Functions

# endregion Functions
