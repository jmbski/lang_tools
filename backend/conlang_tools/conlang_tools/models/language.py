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

    Module Name: word
    Description: Representation of the component parts of a word
    Author: Joseph Bochinski
    Date: 2024-10-23


#######################################################################
"""

# region Imports
from __future__ import annotations

from collections.abc import Callable
from dataclasses import dataclass, field
from typing import Any

from conlang_tools.common import utils
from conlang_tools.lt_sql import Base
from conlang_tools.models.base_element import BaseElement


# endregion Imports


# region Constants


# endregion Constants


@dataclass
class GPCUnit:
    """Representation of a grapheme-phoneme correspondence in a language"""

    phoneme: str = ""
    """ IPA characters representing the sounds that produce this phoneme """

    grapheme: str = ""
    """ Associated grapheme character(s) that represent the phoneme in text """

    gpc_id: int = -1
    """ Unique identifier for this GPCUnit """

    lang_config_id: int = -1
    """ Unique identifier for the language configuration this GPCUnit belongs to """


type PhonemeParser = Callable[[str], GPCUnit]
type PhonemeListParser = Callable[[list[str]], list[GPCUnit]]


def parse_phonemes(
    phonemes: list[Any],
    phoneme_parser: PhonemeParser = None,
) -> list[GPCUnit]:
    """Parse a list of phonemes into a list of Phoneme objects

    Args:
        phonemes (list[Any]): List of phoneme definitions
        phoneme_parser (PhonemeParser, optional): An optional string parser
            that returns a Phoneme instance. Defaults to None.
        grapheme_parser (GraphemeParser, optional): An optional string
            parser that maps a grapheme to a provided phoneme string.
            Defaults to None.

    Raises:
        TypeError: phonemes is not a list
        TypeError: Invalid phoneme definition

    Returns:
        list[Phoneme]: List of Phoneme objects
    """

    if not isinstance(phonemes, list):
        raise TypeError("Provided phonemes definition is not list\n", phonemes)

    parsed: list[GPCUnit] = []

    for i, phoneme in enumerate(phonemes):

        if isinstance(phoneme, str):
            if phoneme_parser:
                parsed.append(phoneme_parser(phoneme))
            # else:
            # grapheme = grapheme_parser(phoneme) if grapheme_parser else phoneme
            # parsed.append(GPCUnit(phones=[phoneme], grapheme=grapheme))
        elif isinstance(phoneme, dict):
            parsed.append(GPCUnit(**phoneme))
        elif isinstance(phoneme, GPCUnit):
            parsed.append(phoneme)
        elif isinstance(phoneme, Base):
            parsed.append(GPCUnit(**phoneme.to_json()))
        elif isinstance(phoneme, BaseElement):
            parsed.append(GPCUnit(**phoneme.to_dict()))
        else:
            raise TypeError(f"Invalid phoneme definition at [{i}]: {phoneme}")

    return parsed


@dataclass
class Syllable:

    gpc_units: list[GPCUnit] = field(default_factory=list)
    """ List of GPCUnit objects that make up this syllable """

    phonemes: list[str] = field(default_factory=list)
    """ List of phonemes that make up this syllable """

    graphemes: list[str] = field(default_factory=list)
    """ Associated grapheme character(s) that represent the syllable in text, 
        generated from phoneme objects """

    phoneme_parser: PhonemeParser = None
    """ A provided function that generates a Phoneme object from a string """

    # TODO: potentially add IDs for self and language config and map to DB

    def __post_init__(self) -> None:
        pass

    def __str__(self) -> str:
        return "".join(self.graphemes)

    def __repr__(self):
        phonemes = ", ".join(self.phonemes)
        graphemes = ", ".join(self.graphemes)

        return f"[Syllable]: `{phonemes}` => `{graphemes}` => {str(self)}"


@dataclass
class Word:
    syllables: list[Syllable] = field(default_factory=list)
    ipa: str = ""
    plain_text: str = ""
    phonemes: list[str] = field(default_factory=list)
    graphemes: list[str] = field(default_factory=list)

    def __post_init__(self) -> None:
        self.ipa = "".join(self.phonemes)
        self.plain_text = "".join(self.graphemes)

    def __str__(self) -> str:
        return "".join(str(s) for s in self.syllables)

    def __repr__(self):
        phonemes = ", ".join(self.phonemes)
        graphemes = ", ".join(self.graphemes)

        return f"[Word]: `{phonemes}` => `{graphemes}` => {str(self)}"


# region Classes
class ConlangWord(BaseElement):
    """Representation of the component parts of a word"""

    def __init__(self, **kwargs):
        self.word_ipa: str = ""
        self.word_con: str = ""
        self.phonemes: list[str] = []
        self.graphemes: list[str] = []
        self.ipa_syllables: list[list[str]] = []
        self.con_syllables: list[list[str]] = []

        super().__init__(**kwargs)
        self.assemble_word()

    def assemble_word(self) -> None:
        """Assemble the word from its component parts"""

        self.phonemes = utils.flatten_list(self.ipa_syllables)
        self.graphemes = utils.flatten_list(self.con_syllables, str)
        self.word_ipa = "".join(self.phonemes)
        self.word_con = "".join(self.graphemes)

    def __str__(self):
        return self.word_con

    def __repr__(self):
        return self.word_con


# endregion Classes


# region Functions

# endregion Functions
