""" Module for processing SQL queries """

from typing import Any

from sqlalchemy import insert, update, select
from sqlalchemy.orm import Session

from conlang_tools.lt_sql.sql_conn import SQL_CONN
from conlang_tools.lt_sql.entities import (
    DbSynset,
    DbConlangWord,
    DbLangConfig,
    db_conlang_defs,
    DbLexicon,
    ENTITY_MAPPING,
)


class QueryHandler:
    """Class to handle query requests"""

    def __init__(self, action: str = None, params: dict = None) -> None:
        session, session_id = SQL_CONN.get_session()

        self.session: Session = session
        self.session_id: str = session_id

        self.action = action
        self.params = params

        self.handle_action()

    def handle_action(self) -> Any:
        """Process requested action

        Returns:
            Any: TODO: determine actual return type
        """

    def get_all_synsets(self):
        """Function to get all synsets from the database

        Returns:
            list[dict]: Synset values retrieved from DB
        """

        synsets = self.session.query(DbSynset).all()

        # Example of serializing synsets to JSON

        synsets_list = [
            {
                "db_id": synset.db_id,
                "synset_id": synset.synset_id,
                "definition": synset.definition,
                "pos": synset.pos,
                "examples": synset.examples,
                "lemmas": synset.lemmas,
                "eng_word": synset.eng_word,
            }
            for synset in synsets
        ]

        return synsets_list

    def get_lang_configs(self):
        """Function to get the language configurations from the database"""

        lang_configs = self.session.query(DbLangConfig).all()

        return [lang_config.to_json() for lang_config in lang_configs]

    def get_lang_config(self, lang_config_id: int) -> dict | None:
        """Function to get a language configuration from the database

        Args:
            lang_config_id (int): ID of the language configuration to retrieve

        Returns:
            dict | None: Language configuration retrieved from DB
        """

        lang_config = (
            self.session.query(DbLangConfig)
            .filter(DbLangConfig.lang_config_id == lang_config_id)
            .first()
        )

        return lang_config

    def query_all(self, entity_name: str):
        """Function to query all entities of a given type

        Args:
            entity_name (str): Name of the entity to query

        Returns:
            list[dict]: List of entities retrieved from DB
        """

        entity = ENTITY_MAPPING.get(entity_name)
        if not entity:
            return []

        entities = self.session.query(entity).all()

        return [entity.to_json() for entity in entities]

    def get_synset(self, synset_id: str | int):
        """Function to get a synset from the database"""

        synset = (
            self.session.query(DbSynset)
            .filter(
                DbSynset.synset_id == synset_id
                if isinstance(synset_id, str)
                else DbSynset.db_id == synset_id
            )
            .first()
        )

        return synset

    def save_synset(self, synset: dict):
        """Function to save a synset to the database"""

        db_synset = self.get_synset(synset.get("synset_id"))

        if db_synset:
            # if it already exists, update the value in the database
            db_synset = self.session.scalars(
                update(DbSynset)
                .where(DbSynset.synset_id == synset.get("synset_id"))
                .values(synset)
                .returning(DbSynset)
            )

        else:
            # utils.pretty_print(synset)
            if not synset.get("db_id"):
                synset.pop("db_id", None)
            db_synset = self.session.scalars(
                insert(DbSynset).returning(DbSynset), [synset]
            )
        db_synset = db_synset.first()

        return db_synset

    def delete_synset(self, synset_db_id: int):
        """Function to delete a synset from the database"""

        try:
            synset = self.get_synset(synset_db_id)
            name = synset.eng_word
            if synset:
                self.session.delete(synset)
                self.session.commit()
                return {"status": "success", "message": f"Synset {name} deleted"}
        except Exception as e:
            print(f"Error deleting synset: {e}")
            return {"status": "error", "message": str(e)}

    def get_lexicon(self, lang_id: int):
        """Function to get the lexicon for a language"""

        lexicon = (
            self.session.query(DbLexicon)
            .filter(DbLexicon.lang_config_id == lang_id)
            .all()
        )

        return lexicon

    def get_conlang_word_by_id(
        self, word_id: int | str, lang_config_id: int
    ) -> DbConlangWord:
        """Function to get a conlang word by ID from the database

        Args:
            word_id (int | str): ID of the word to retrieve
            lang_config_id (int): ID of the language configuration

        Returns:
            ConlangWord: Conlang word retrieved from DB
        """

        if isinstance(word_id, int):
            # AI Generated, may need tweaking
            db_conlang_word = self.session.scalars(
                select(DbConlangWord)
                .where(DbConlangWord.word_id == word_id)
                .where(DbConlangWord.lang_config_id == lang_config_id)
            ).first()
        else:
            db_conlang_word = self.session.scalars(
                select(DbConlangWord)
                .where(DbConlangWord.word == word_id)
                .where(DbConlangWord.lang_config_id == lang_config_id)
            ).first

        return db_conlang_word

    def get_conlang_word(self, conlang_word: dict) -> DbConlangWord:
        """Function to get a conlang word from the database

        Args:
            conlang_word (dict): Conlang word to retrieve

        Returns:
            ConlangWord: Conlang word retrieved from DB
        """

        word_id = conlang_word.get("word_id")

        if isinstance(conlang_word, dict):
            db_conlang_word = self.session.scalars(
                select(DbConlangWord)
                .where(
                    DbConlangWord.word_id == word_id
                    if word_id
                    else DbConlangWord.word == conlang_word.get("word")
                )
                .where(
                    DbConlangWord.lang_config_id
                    == conlang_word.get("lang_config_id")
                )
            ).first()

            return db_conlang_word

    def save_conlang_word(self, conlang_word: dict) -> DbConlangWord:
        """Function to save a conlang word to the database

        Args:
            conlang_word (dict): Conlang word to save

        Returns:
            ConlangWord: Conlang word saved to DB
        """
        print("conlang_word:", conlang_word)
        word = self.get_conlang_word(conlang_word)
        print("word:", word)
        if self.get_conlang_word(conlang_word):

            db_word = self.session.scalars(
                update(DbConlangWord)
                .where(DbConlangWord.word_id == conlang_word.get("word_id"))
                .values(conlang_word)
                .returning(DbConlangWord)
            ).first()
        else:
            db_word = self.session.scalars(
                insert(DbConlangWord).returning(DbConlangWord), [conlang_word]
            ).first()

        return db_word

    def get_conlang_def(self, synset_db_id: int, conlang_word_id: int) -> Any:
        """Function to get a conlang definition from the database

        Args:
            synset_db_id (int): Synset database ID
            conlang_word_id (int): Conlang word ID

        Returns:
            Any: TODO: determine actual return type
        """

        conlang_def = (
            self.session.query(db_conlang_defs)
            .filter(db_conlang_defs.c.db_id == synset_db_id)
            .filter(db_conlang_defs.c.word_id == conlang_word_id)
            .first()
        )

        return conlang_def

    def associate_conlang_synset(
        self,
        conlang_word: DbConlangWord | str | int,
        synset: DbSynset | str,
        lang_id: int = 1,
    ):
        """Function to associate a conlang word with a synset"""

        if not isinstance(conlang_word, DbConlangWord):
            if isinstance(conlang_word, (int, str)):
                conlang_word = self.get_conlang_word_by_id(conlang_word, lang_id)
            else:
                conlang_word = self.get_conlang_word(conlang_word)
        if not isinstance(synset, DbSynset):
            synset = self.get_synset(synset)

        if conlang_word and synset:
            word_id = conlang_word.word_id
            link_ref = self.get_conlang_def(synset.db_id, word_id)
            if link_ref:
                pass
            else:
                self.session.execute(
                    insert(db_conlang_defs).values(
                        db_id=synset.db_id, word_id=word_id
                    )
                )

    def save_lang_config(self, lang_config: dict):
        """Function to save a language configuration to the database"""

        db_lang_config = self.get_lang_config(lang_config.get("lang_config_id"))

        if db_lang_config:
            # if it already exists, update the value in the database
            print("updating lang_config:", lang_config["lang_config_id"])
            db_lang_config = self.session.scalars(
                update(DbLangConfig)
                .where(DbLangConfig.lang_config_id == lang_config["lang_config_id"])
                .values(lang_config)
                .returning(DbLangConfig),
            )

        else:
            # utils.pretty_print(synset)
            lang_config.pop("lang_config_id", None)
            db_lang_config = self.session.scalars(
                insert(DbLangConfig).returning(DbLangConfig), [lang_config]
            )

        return db_lang_config

    def close_session(self):
        """Close the session"""

        SQL_CONN.close_session(self.session_id, commit=True)
