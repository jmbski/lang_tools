""" REPL for interacting with the various conlang tools """

import argparse
import json

from dataclasses import dataclass
from typing import Any

import nltk

from replbase import ReplBase

from conlang_tools.common import CONFIG
from conlang_tools.models import LanguageConfig, ConlangWord
from conlang_tools.language_tools import WordGenerator, nltk_utils
from conlang_tools.lt_sql import QueryHandler


@dataclass
class ReplHandler(ReplBase):
    """Class for handling REPL interactions"""

    lang_config: LanguageConfig = None
    """ Currently loaded language configuration """

    word_generator: WordGenerator = None
    """ Currently loaded word generator """

    def __post_init__(self):
        super().__post_init__()
        self._add_ld_lang()
        self._add_gen_words()
        self._add_synset()
        self.add_command(
            "check_nltk", nltk_utils.check_data, help_txt="Check NLTK data"
        )

    def _add_ld_lang(self) -> None:

        ld_lang_cmd = self.add_command(
            "load_language",
            self.load_language,
            help_txt="Load an existing language configuration",
            use_parser=True,
        )
        ld_lang_cmd.parser.add_argument(
            "--name-id",
            "-n",
            help="Name or ID of a specific language config to load",
        )

    def _add_gen_words(self) -> None:

        gen_word_cmd = self.add_command(
            "gen_words",
            self.gen_words,
            help_txt="Generate a list of words using the current language config",
            use_parser=True,
        )
        gen_word_cmd.parser.add_argument(
            "--count", "-c", default=1, help="Number of words to generate", type=int
        )
        gen_word_cmd.parser.add_argument(
            "--syllables",
            "-s",
            default=0,
            type=int,
            help="Number of syllables in each word",
        )
        gen_word_cmd.parser.add_argument(
            "--minimum",
            "-m",
            default=1,
            type=int,
            help="Minimum number of syllables in each word",
        )
        gen_word_cmd.parser.add_argument(
            "--maximum",
            "-M",
            default=3,
            type=int,
            help="Maximum number of syllables in each word",
        )

    def _add_synset(self) -> None:
        synset_cmd = self.add_command(
            "synsets",
            self.synset_test,
            help_txt="testing wordnet features",
            use_parser=True,
        )
        synset_cmd.parser.add_argument(
            "word",
            help="Word to get synsets for",
        )

    def check_prop(self, prop_name: str) -> bool:

        if not hasattr(self, prop_name):
            self.warn(f"{prop_name} is not a defined propery")
            return False

        if not getattr(self, prop_name):
            self.warn(f"{prop_name} is not set")
            return False

        return True

    def check_lang(self) -> None:
        if not self.lang_config:
            self.warn("No language config loaded")
            self.load_language()

    def load_language(self, args: argparse.Namespace = None) -> None:

        name_id = None
        if args:
            name_id: str = args.name_id

        if not name_id:
            query_handler = QueryHandler()
            lang_configs = [
                LanguageConfig(**config)
                for config in query_handler.get_lang_configs()
            ]

            options = {lc.name: lc for lc in lang_configs}
            self.lang_config = self.input_choice_dict(
                "Select a language config: ", options
            )
            self.print(f"`{self.lang_config.name}` selected as current language")

            self.word_generator = WordGenerator(lang_config=self.lang_config)

    def gen_words(self, args: argparse.Namespace = None) -> list[ConlangWord]:

        self.check_lang()
        count: int = 1
        syllables: int = None
        minimum: int = 1
        maximum: int = 3

        if args:
            count = args.count
            syllables = args.syllables
            minimum = args.minimum
            maximum = args.maximum
        self.print(
            f"Generating {count} words with params: syllables={syllables}, minimum={minimum}, maximum={maximum}"
        )
        words = [
            self.word_generator.generate_word(
                syllables=syllables, minimum=minimum, maximum=maximum
            )
            for _ in range(count)
        ]

        self.pretty_print(words)
        return words

    def synset_test(self, args: argparse.Namespace = None) -> None:
        word = args.word

        nltk_utils.get_synsets(word)
