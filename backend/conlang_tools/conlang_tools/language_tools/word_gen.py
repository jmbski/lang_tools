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

    Module Name: word_gen
    Description: Module containing code that generates words based on a
    language configuration
    Author: Joseph Bochinski
    Date: 2024-10-23


#######################################################################
"""

# region Imports
from random import choices

from conlang_tools.common import utils
from conlang_tools.models import BaseElement, LanguageConfig, ConlangWord


# endregion Imports


# region Constants

# endregion Constants


# region Classes


class WordGenerator(BaseElement):
    """Class to generate words from a language configuration"""

    def __init__(self, **kwargs):
        super().__init__(**kwargs)

        self.lang_config: LanguageConfig | dict = kwargs.get("lang_config", {})

        if isinstance(self.lang_config, dict):
            self.lang_config = LanguageConfig(**self.lang_config)

        orth_keys, orth_values = self.lang_config.get_syllable_pairs()
        self.orth_keys: list[str] = orth_keys
        self.orth_values: list[int] = orth_values

    def get_orth_category(self) -> str:
        """Get a random orthographic category based on the language
        configuration

        Returns:
            str: The orthographic category
        """

        return choices(self.orth_keys, self.orth_values)[0]

    def generate_syllable(
        self, category: str | None = None
    ) -> tuple[list[str], list[str]]:
        """Generate a syllable from an orthographic category

        Args:
            category (str | None, optional): The orthographic category
                to generate from. Defaults to None. If None, a random
                category will be selected.

        Returns:
            tuple[list[str], list[str]]: The conlang and IPA
            representation of the syllable
        """

        category = category or self.get_orth_category()
        con_syllable = []
        ipa_syllable = []

        for letter in category:
            phonemes = self.lang_config.orthography_categories.get(letter)

            if not phonemes:
                continue

            index = utils.rand_int(0, len(phonemes) - 1)

            phoneme = phonemes[index]

            ipa = self.lang_config.phonetic_inventory.get(phoneme)

            if not ipa:
                continue
            ipa_syllable.append(ipa)
            con_syllable.append(phoneme)

        return con_syllable, ipa_syllable

    def generate_word(
        self, syllables: int = None, minimum: int = 1, maximum: int = 3
    ) -> ConlangWord:
        """Generate a word based on the language configuration

        Args:
            syllables (int, optional): Explicit number of syllables to
                generate. Defaults to None. If None, a random number of
                syllables will be generated.
            minimum (int, optional): Minimum number of syllables to
                generate. Defaults to 1.
            maximum (int, optional): Maximum number of syllables to
                generate. Defaults to 3.

        Returns:
            Word: The generated word
        """

        count = syllables or utils.rand_int(minimum, maximum)

        word = ConlangWord()

        for _ in range(count):
            con_syllable, ipa_syllable = self.generate_syllable()
            word.con_syllables.extend(con_syllable)
            word.ipa_syllables.extend(ipa_syllable)

        word.assemble_word()

        return word

    def generate_words(
        self, count: int, syllables: int = None, minimum: int = 1, maximum: int = 3
    ) -> list[ConlangWord]:
        """Generate a list of words based on the language configuration

        Args:
            count (int): Number of words to generate
            syllables (int, optional): Explicit number of syllables to
                generate. Defaults to None. If None, a random number of
                syllables will be generated.
            minimum (int, optional): Minimum number of syllables to
                generate. Defaults to 1.
            maximum (int, optional): Maximum number of syllables to
                generate. Defaults to 3.

        Returns:
            list[Word]: List of generated words
        """

        words = []

        for _ in range(count):
            words.append(self.generate_word(syllables, minimum, maximum))

        return words


# endregion Classes


# region Functions

# endregion Functions
