import os
from conlang_tools.models import LanguageConfig, ConlangWord, BaseElement
from conlang_tools.language_tools import WordGenerator
from conlang_tools.common import utils

DIR_PATH = os.path.dirname(__file__)
TEST_DATA = os.path.join(DIR_PATH, "test_data")

configs_path = os.path.join(TEST_DATA, "lang_configs.yaml")
configs = BaseElement.load_from_file(configs_path, BaseElement)
configs.out_path = os.path.join(TEST_DATA, "lang_configs.yaml")

first_speech_data = getattr(configs, "The First Speech")
first_speech = LanguageConfig(**first_speech_data)
word_gen = WordGenerator(lang_config=first_speech.to_dict())


for i in range(100):
    print(word_gen.generate_word())
