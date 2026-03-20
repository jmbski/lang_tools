""" JSON Representation of a Synset """

from dataclasses import dataclass
from typing import Any

from nltk.corpus.reader.wordnet import Synset, Lemma


@dataclass
class LtSynset:
    """Class representation for this apps version of a Synset"""

    eng_word: str = None
    synset_id: str = None
    pos: Any = None
    definition: Any = None
    examples: list = None
    lemmas: list = None
    hypernyms: list = None
    hyponyms: list = None
    holonyms: list = None
    meronyms: list = None

    def __post_init__(self) -> None:
        # TODO: Investigate implementing as a class
        pass
