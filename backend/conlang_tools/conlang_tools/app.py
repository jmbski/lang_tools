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

    Module Name: flask app
    Description: Flask REST API for the conlang_tools package
    Author: Joseph Bochinski
    Date: 2024-10-23


#######################################################################
"""

import json

from flask import Flask, request, Response, g
from flask_cors import CORS

from cw_logging import configure_logger

from conlang_tools.common import COMBINED
from conlang_tools.models import LanguageConfig, ConlangWord, BaseElement
from conlang_tools.language_tools import nltk_utils, WordGenerator
from conlang_tools.lt_sql import QueryHandler, DbLangConfig


def get_app():

    app_logger = configure_logger("conlang_tools")

    nltk_utils.check_data()

    app = Flask(__name__)

    CORS(app, resources={r"/services/*": {"origins": "*"}})

    @app.before_request
    def before_request():
        g.query_handler = QueryHandler()
        app_logger.info("Request received")

    @app.after_request
    def after_request(response):
        g.query_handler.close_session()
        return response

    @app.route("/services/test", methods=["GET", "POST"])
    def test():
        return Response(
            json.dumps({"status": "success"}), mimetype="application/json"
        )

    @app.route("/services/get-lang-configs", methods=["GET", "POST"])
    def get_lang_configs():
        configs = g.query_handler.get_lang_configs()

        return Response(json.dumps(configs), mimetype="application/json")

    @app.route("/services/get-base-words", methods=["GET", "POST"])
    def get_base_words():
        return Response(json.dumps(COMBINED), mimetype="application/json")

    @app.route("/services/get-synsets", methods=["GET"])
    def get_synsets():
        word = request.args.get("word")
        synset_json = nltk_utils.get_synsets_json(word)

        return Response(
            json.dumps(synset_json, indent=4), mimetype="application/json"
        )

    @app.route("/services/save-synsets", methods=["GET", "POST"])
    def save_synsets():
        synsets = request.get_json()
        if isinstance(synsets, list):
            # synsets = [ AttrDict(synset) for synset in synsets ]

            for synset in synsets:
                g.query_handler.save_synset(synset)

            return Response(
                json.dumps({"status": "success"}), mimetype="application/json"
            )

    @app.route("/services/delete-synset", methods=["DELETE"])
    def delete_synset():
        handler: QueryHandler = g.query_handler
        synset_id = request.args.get("synsetDbId", type=int)
        response = handler.delete_synset(synset_id)
        return Response(json.dumps(response), mimetype="application/json")

    @app.route("/services/get-lexicon", methods=["GET", "POST"])
    def get_lexicon():

        handler: QueryHandler = g.query_handler
        lang_config_id = request.args.get("langConfigId", type=int)
        lexicon = handler.get_lexicon(lang_config_id)

        if isinstance(lexicon, list):
            lexicon = [word.to_json() for word in lexicon]
        return Response(json.dumps(lexicon), mimetype="application/json")

    @app.route("/services/get-words", methods=["GET"])
    def get_words():
        words = {}

        return Response(json.dumps(words), mimetype="application/json")

    @app.route("/services/gen-conlang-word", methods=["GET", "POST"])
    def gen_conlang_word():

        resp = {}
        lang_config_id = request.args.get("langConfigId", type=int)
        handler: QueryHandler = g.query_handler

        lang_config_data = handler.get_lang_config(lang_config_id)

        if isinstance(lang_config_data, DbLangConfig):
            lang_config_data = lang_config_data.to_json()
        if isinstance(lang_config_data, dict):
            lang_config = LanguageConfig(**lang_config_data)

            syllables = request.args.get("syllables", type=int)
            minimum = request.args.get("minimum", type=int)
            maximum = request.args.get("maximum", type=int)

            word_gen = WordGenerator(lang_config=lang_config)
            word = word_gen.generate_word(syllables, minimum, maximum)
            # word, ipa = lang_config.generate_word(syllables, minimum, maximum)
            # resp = {"word": word, "ipa": ipa}
            resp = {"word": word.word_con, "ipa": word.word_ipa}

        return Response(json.dumps(resp), mimetype="application/json")

    @app.route("/services/gen-conlang-words", methods=["GET", "POST"])
    def gen_conlang_words():

        resp = []
        lang_config_id = request.args.get("langConfigId", type=int)
        handler: QueryHandler = g.query_handler

        lang_config_data = handler.get_lang_config(lang_config_id)

        if isinstance(lang_config_data, DbLangConfig):
            lang_config_data = lang_config_data.to_json()
        if isinstance(lang_config_data, dict):
            lang_config = LanguageConfig(**lang_config_data)

            count = request.args.get("count", type=int)
            syllables = request.args.get("syllables", type=int)
            minimum = request.args.get("minimum", type=int)
            maximum = request.args.get("maximum", type=int)

            word_gen = WordGenerator(lang_config=lang_config)
            words = word_gen.generate_words(count, syllables, minimum, maximum)
            # word, ipa = lang_config.generate_word(syllables, minimum, maximum)
            # resp = {"word": word, "ipa": ipa}
            resp = [{"word": word.word_con, "ipa": word.word_ipa} for word in words]

        return Response(json.dumps(resp), mimetype="application/json")

    @app.route("/services/langconfig-gen-words", methods=["GET", "POST"])
    def langconfig_gen_words():
        req_data = request.get_json()
        resp = []

        if isinstance(req_data, dict):
            lang_config_data = req_data.get("langConfig")
            lang_config = LanguageConfig(**lang_config_data)

            amount = req_data.get("amount")
            syllables = req_data.get("syllables")
            minimum = req_data.get("minimum")
            maximum = req_data.get("maximum")

            word_gen = WordGenerator(lang_config=lang_config)

            words = word_gen.generate_words(amount, syllables, minimum, maximum)
            resp = [{"word": word.word_con, "ipa": word.word_ipa} for word in words]

        return Response(json.dumps(resp), mimetype="application/json")

    @app.route("/services/save-lex-entry", methods=["GET", "POST"])
    def save_lex_entry():
        params = request.get_json()

        word = params.get("conlangWord")
        synset = params.get("synset")
        lang_config_id = params.get("langConfigId")

        handler: QueryHandler = g.query_handler

        db_word = handler.save_conlang_word(word)
        db_synset = handler.save_synset(synset)

        if db_word and db_synset:
            handler.associate_conlang_synset(db_word, db_synset, lang_config_id)

        return Response(
            json.dumps({"status": "success"}), mimetype="application/json"
        )

    @app.route("/services/save-lang-config", methods=["GET", "POST"])
    def save_lang_config():

        params = request.get_json()
        handler: QueryHandler = g.query_handler

        handler.save_lang_config(params)

        return Response(
            json.dumps({"status": "success"}), mimetype="application/json"
        )

    return app


if __name__ == "__main__":
    app.run(port=5000, debug=True)
