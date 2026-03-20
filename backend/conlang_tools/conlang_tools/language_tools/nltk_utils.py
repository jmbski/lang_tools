""" Tools for working with NLTK and WordNet. """

import os

from typing import Any

import nltk

from nltk.corpus import wordnet2022 as wn
from nltk.corpus.reader.wordnet import Synset, Lemma

from conlang_tools.common import consts


def check_data() -> None:
    """Check the common locations to see if NLTK data has been downloaded"""

    for pkg in consts.NLTK_PACKAGES:
        path = os.path.join(consts.NLTK_DATA_PATH, f"{pkg}.zip")
        if not os.path.exists(path):
            nltk.download(pkg, path)


def synset_name(wn_object: Synset | Lemma) -> str:
    return (
        wn_object.name().split(".")[0]
        if isinstance(wn_object, Synset)
        else wn_object.name()
    )


def get_definition(synset_id: str) -> dict:
    """Returns the definition of a given synset"""
    synset = wn.synset(synset_id)
    if synset:
        return {"word": synset.name(), "definition": synset.definition()}


def get_synset_json(synset: str | Synset) -> dict:
    """Returns a JSON object that contains the synset of a given word"""
    if isinstance(synset, str):
        synset = wn.synset(synset)

    if isinstance(synset, Synset):
        synset_json = {
            "eng_word": synset_name(synset),
            "synset_id": synset.name(),
            "pos": synset.pos(),
            "definition": synset.definition(),
            "examples": synset.examples(),
            "lemmas": [lemma.name() for lemma in synset.lemmas()],
            "hypernyms": [hypernym.name() for hypernym in synset.hypernyms()],
            "hyponyms": [hyponym.name() for hyponym in synset.hyponyms()],
            "holonyms": [holonym.name() for holonym in synset.member_holonyms()],
            "meronyms": [meronym.name() for meronym in synset.part_meronyms()],
        }

        return synset_json
    return {}


def get_synsets_json(word: str) -> list:
    """Returns a JSON object that contains the synset(s) of a given word"""
    if "." in word:
        return [get_synset_json(word)]

    synsets = wn.synsets(word)
    if not synsets:
        return []

    return [get_synset_json(synset) for synset in synsets]


def get_synsets(eng_word: str) -> Any:
    print(wn.synsets(eng_word))
