""" Utilities for working with data. """

import csv
import itertools
import json
import os
import re


from collections import defaultdict
from dataclasses import dataclass, field
from typing import Any
from random import randint, choices

from phonecodes import phonecodes

from conlang_tools.common import CONFIG, utils

PATH_MAP = {
    "basic": os.path.join(CONFIG.data_dir, "german_phonemes_basic.txt"),
    "phonemes": os.path.join(CONFIG.data_dir, "german_phonemes.txt"),
    "syllables": os.path.join(CONFIG.data_dir, "german_syllables.txt"),
    "bigram_all": os.path.join(CONFIG.data_dir, "german_bigram_all.txt"),
    "bigram": os.path.join(CONFIG.data_dir, "german_bigram.csv"),
    "syl_bigram": os.path.join(CONFIG.data_dir, "german_syl_bigram.txt"),
    "grapheme": os.path.join(CONFIG.data_dir, "german_graphemes.txt"),
    "inventory": os.path.join(CONFIG.data_dir, "german_phonetic_inventory.yaml"),
}

PHONETIC_INVENTORY: dict[str, str] = utils.read_file(PATH_MAP["inventory"])

CellDataType = str | int | float


@dataclass
class LangStatsData:
    """Class to hold language statistics"""

    lines: list[str] = None
    fields: list[str] = None
    rows_raw: list[list[CellDataType]] = None
    rows: list[dict[str, CellDataType]] = None

    def __str__(self) -> str:
        return f"LangStats: {self.fields}"


@dataclass
class GraphemeData:
    ipa: str = None
    grapheme: str = None
    alts: list[str] = None


@dataclass
class Syllable:
    phonemes: list[str] = field(default_factory=list)
    graphemes: list[str] = field(default_factory=list)

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


def parse_german_lang_stats(
    file_name: str = "phonemes",
    str_cols: list[int] = None,
    sort_cols: list[int] = None,
) -> LangStatsData:
    """Function to interpret and work with the German language study files

    Returns:
        Any: Not sure yet
    """

    str_cols = str_cols or [0]
    sort_cols = sort_cols or [1]

    path = PATH_MAP.get(file_name, PATH_MAP["phonemes"])

    if path.endswith(".csv"):
        print("CSV not implemented yet")
        return

    lines = utils.read_file(path, as_lines=True)[3:]
    fields = [field.strip() for field in lines[0].split("\t")]
    rows_raw = lines[1:]
    rows_raw = [[cell.strip() for cell in row.split("\t")] for row in rows_raw]

    for row in rows_raw:
        for i, cell in enumerate(row):
            try:
                if i not in str_cols:
                    if "." in cell or "e" in cell:
                        row[i] = float(cell)
                    else:
                        row[i] = int(cell)
            except ValueError:
                pass

    rows_raw.sort(key=lambda x: ([x[i] for i in sort_cols]), reverse=True)

    rows = [dict(zip(fields, row)) for row in rows_raw]

    return LangStatsData(lines=lines, fields=fields, rows_raw=rows_raw, rows=rows)


def parse_syllables() -> Any:
    """Parse out the syllable information from file

    Returns:
        Any: Not sure yet
    """

    syllable_data = parse_german_lang_stats("syllables", [1])
    phoneme_data = parse_german_lang_stats()
    phonemes = [p[0] for p in phoneme_data.rows_raw]
    return syllable_data, phoneme_data, phonemes


def map_xsampa_to_graphemes():
    lines = utils.read_file(PATH_MAP["grapheme"], as_lines=True, encoding="UTF-8")
    lines = [
        line.strip() for line in lines if line.strip() and not line.startswith("#")
    ]

    grapheme_re = re.compile(r"\[(.+)\]")

    ipa_grapheme_map: dict[str, str] = {}

    for line in lines:
        parts = line.split()
        ipa = parts[0]
        usage = parts[1]
        grapheme = grapheme_re.findall(usage)[0]
        ipa_grapheme_map[ipa] = grapheme

        if len(parts) > 2:
            alts = parts[2:]
            for alt in alts:
                ipa_grapheme_map[alt] = grapheme

    phonemes = [
        phonecodes.xsampa2ipa(row[0]) for row in parse_german_lang_stats().rows_raw
    ]

    phone_to_graph: dict[str, str] = {}

    unmatched: list[str] = []

    for p in phonemes:
        if p in ipa_grapheme_map:
            phone_to_graph[p] = ipa_grapheme_map[p]
        else:
            unmatched.append(p)

    fully_unmapped = []

    for p in unmatched:
        combinations = utils.get_str_combinations(p)
        phoneme = p
        grapheme = ""
        for combo in combinations:
            if combo in ipa_grapheme_map and combo in p:
                # TODO: perhaps switch to getting the indices of each?
                grapheme += ipa_grapheme_map[combo]
                p = p.replace(combo, "", 1)
        if grapheme:
            print(f"{phoneme} = {grapheme}")
            phone_to_graph[phoneme] = grapheme
        else:
            fully_unmapped.append(phoneme)
    return phone_to_graph


def get_graphemes(phoneme: str) -> str:
    combinations = utils.get_str_combinations(phoneme)
    grapheme = ""
    indices: list[str] = [phoneme]

    for combo in combinations:
        if not phoneme:
            break

        if combo in PHONETIC_INVENTORY and combo in phoneme:
            indices = utils.split_str_by_terms(indices, [combo])
            phoneme = phoneme.replace(combo, "")

    grapheme = "".join([PHONETIC_INVENTORY.get(g, "") for g in indices])

    return grapheme


def parse_syllable(text: str) -> Syllable:
    combinations = utils.get_str_combinations(text)
    phonemes: list[str] = [text]

    for combo in combinations:
        if not text:
            break

        if combo in PHONETIC_INVENTORY and combo in text:
            phonemes = utils.split_str_by_terms(phonemes, [combo])
            text = text.replace(combo, "")

    graphemes = [PHONETIC_INVENTORY.get(p, "") for p in phonemes]

    return Syllable(phonemes=phonemes, graphemes=graphemes)


def ipa_graphemes_to_file():
    ipa_to_graph = map_xsampa_to_graphemes()
    path = os.path.join(CONFIG.data_dir, "german_phonetic_inventory.yaml")
    utils.write_data_file(path, ipa_to_graph)


def map_syllables():
    syllable_data = parse_german_lang_stats("syllables", [1], [2])
    syllables = [r[1] for r in syllable_data.rows_raw]
    syllables = [phonecodes.xsampa2ipa(s) for s in syllables]

    syllables = [parse_syllable(s) for s in syllables]
    syl_map = {str(s): s.phonemes for s in syllables}

    return syllables


def get_most_probable(phoneme: str) -> str:
    prob_map = get_probability_map()
    p_probs: dict = prob_map.get(phoneme)
    # values = [(k, v) for k, v in p_probs.items()]
    # values.sort(key=lambda x: x[1], reverse=True)
    keys = list(p_probs.keys())
    values = list(p_probs.values())
    return choices(keys, values)[0]


def rand_test(count: int = 3):
    # phones = [r[0] for r in parse_german_lang_stats().rows_raw]
    # phones = [phonecodes.xsampa2ipa(p) for p in phones]

    char = get_most_probable("!ENTER")

    new_str = get_graphemes(char)
    new_ipa = char
    for _ in range(count):
        char = get_most_probable(char)
        new_str += get_graphemes(char)
        new_ipa += char

    return new_str, new_ipa


def rand_words(count: int = 20, minimum: int = 1, maximum: int = 4):
    for _ in range(count):
        print(rand_test(randint(minimum, maximum)))


def rand_test_2() -> str:

    max_chars = 30
    count = 0

    char = get_most_probable("!ENTER")
    new_str = get_graphemes(char)
    new_ipa = char

    while True:
        char = get_most_probable(char)
        if char == "!EXIT" or count >= max_chars:
            break

        new_str += get_graphemes(char)
        new_ipa += char
        count += 1

    return new_str, new_ipa


def get_probability_map():
    lines = utils.read_file(PATH_MAP["bigram_all"], as_lines=True)

    data = lines[3:]
    data = [[c.strip() for c in r.split()] for r in data]

    for i, row in enumerate(data):
        parsed_row = []
        for j, cell in enumerate(row):
            if j == 0:
                if cell not in ["!ENTER", "<p:>", "!EXIT"]:
                    cell = phonecodes.xsampa2ipa(cell)
                parsed_row.append(cell)
            else:
                # .320++1
                # ^- comment left by my cat Chaplin

                if isinstance(cell, str) and "*" in cell:
                    val, times = cell.split("*")
                    val = utils.try_float(val)
                    for _ in range(int(times)):
                        parsed_row.append(val)
                else:
                    parsed_row.append(utils.try_float(cell))
        data[i] = parsed_row

    axis_values = [r[0] for r in data]
    matrix_values = [r[1:] for r in data]

    prob_map = defaultdict(dict)

    for y, key in enumerate(axis_values):
        for x, value in enumerate(axis_values):
            prob_map[key][value] = matrix_values[y][x]

    return prob_map


def get_syl_probability_map():
    lines = utils.read_file(PATH_MAP["syl_bigram"], as_lines=True)

    data = lines[3:]
    data = [[c.strip() for c in r.split()] for r in data]

    for i, row in enumerate(data):
        parsed_row = []
        for j, cell in enumerate(row):
            if j == 0:
                if cell not in ["!ENTER", "<usb>", "!EXIT"]:
                    cell = phonecodes.xsampa2ipa(cell)
                parsed_row.append(cell)
            else:
                # .320++1
                # ^- comment left by my cat Chaplin

                if isinstance(cell, str) and "*" in cell:
                    val, times = cell.split("*")
                    val = utils.try_float(val)
                    for _ in range(int(times)):
                        parsed_row.append(val)
                else:
                    parsed_row.append(utils.try_float(cell))
        data[i] = parsed_row

    axis_values = [r[0] for r in data]
    matrix_values = [r[1:] for r in data]

    prob_map = defaultdict(dict)

    for y, key in enumerate(axis_values):
        for x, value in enumerate(axis_values):
            prob_map[key][value] = matrix_values[y][x]

    return prob_map


def build_xsampa_ipa_map() -> dict:
    """Constructs the X-SAMPA/IPA mapping from file

    Returns:
        dict: phoneme mapping
    """

    xsampa_ipa_lines: list = utils.read_file(
        os.path.join(CONFIG.data_dir, "xsampa_ipa_map"),
        as_lines=True,
        encoding="UTF-8",
    )

    xsampa_ipa_map = {}

    split_lines = [
        [char.strip() for char in line.split("\t")] for line in xsampa_ipa_lines
    ]
    for xsampa, ipa in split_lines:
        xsampa_ipa_map[xsampa] = ipa

    return xsampa_ipa_map


def xsampa_to_ipa(langdata: LangStatsData) -> Any:
    """Convert the phonemes present in the data from X-SAMPA to IPA

    Args:
        langdata (LangStatsData): Parsed Language statistics data

    Returns:
        Any: Not sure yet
    """

    xsampa_ipa_map = build_xsampa_ipa_map()

    mapping = {}
    for row in langdata.rows_raw:
        phoneme: str = str(row[0])
        ipa = xsampa_ipa_map.get(phoneme, "N/A")
        mapping[phoneme] = ipa

    return mapping


def xsampa_test():
    langdata = parse_german_lang_stats()

    phonemes = [row[0] for row in langdata.rows_raw]

    for p in phonemes:
        ipa = phonecodes.xsampa2ipa(p, "deu")
        print(f"{p} => {ipa}")


sample_data = {
    "A": ["a", "\u00e0"],
    "B": [
        "\u00e0",
        "\u00ea",
        "\u00e9",
        "\u00f4",
        "\u00f2",
        "\u00f6",
        "\u00fb",
        "\u00fc",
    ],
    "C": ["c", "\u00e7", "kh"],
    "D": ["d", "t", "th", "`th"],
    "E": ["\u00ea", "e", "\u00e9"],
    "F": ["f"],
    "G": ["g", "j"],
    "H": ["'h", "h"],
    "I": ["i"],
    "J": ["a", "e", "i", "o", "u"],
    "K": [
        "'h",
        "'sh",
        "b",
        "bv",
        "c",
        "\u00e7",
        "d",
        "f",
        "g",
        "h",
        "j",
        "kh",
        "l",
        "m",
        "n",
        "p",
        "pf",
        "r",
        "s",
        "sh",
        "t",
        "tch",
        "th",
        "v",
        "w",
        "y",
        "\u017e",
        "z",
        "zh",
        "zsh",
        "`th",
    ],
    "L": ["l"],
    "M": ["m", "n"],
    "O": ["\u00f4", "\u00f2", "o", "\u00f6"],
    "P": ["p", "pf", "b", "bv"],
    "R": ["r"],
    "S": ["'sh", "sh", "tch", "s"],
    "U": ["\u00fb", "\u00fc", "u"],
    "V": [
        "a",
        "\u00e0",
        "\u00ea",
        "e",
        "\u00e9",
        "i",
        "\u00f4",
        "\u00f2",
        "o",
        "\u00f6",
        "\u00fb",
        "\u00fc",
        "u",
    ],
    "W": ["v", "w"],
    "Y": ["y"],
    "Z": ["\u017e", "z", "zh", "zsh"],
    "a": ["a"],
    "e": ["e"],
    "o": ["o"],
    "u": ["u"],
    "b": [" \u00e0", "\u00ea", "\u00e9", "\u00f2"],
    "v": ["v"],
    "p": ["b", "p"],
}
