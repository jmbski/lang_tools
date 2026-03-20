""" Module for managing interactions with the SQLite DB """

import nanoid

from sqlalchemy import create_engine, select, Engine
from sqlalchemy.orm import scoped_session, sessionmaker, Session
from sqlalchemy import insert, update

from conlang_tools.common import consts


class SqliteConnection:
    """Class for handling requests"""

    def __init__(self) -> None:
        self.db_path = consts.CONFIG.db_path
        self.db_uri = f"sqlite:///{self.db_path}"
        self.engine: Engine = None
        self.session_factory = None
        self._session = None
        self.sessions: dict[str, Session] = {}

        self.initialize()

    def initialize(self) -> None:
        """Initialize connection with SQLite database"""

        self.engine = create_engine(self.db_uri)
        self.session_factory = sessionmaker(bind=self.engine)
        self._session = scoped_session(self.session_factory)

    def get_session(self) -> tuple[Session, str]:
        """Create a new SQLite session

        Returns:
            tuple[Session,str]: The new session and its identifier for
                closing
        """

        session = self._session()
        session_id = nanoid.generate()
        while session_id in self.sessions:
            session_id = nanoid.generate()

        self.sessions[session_id] = session

        return self._session(), session_id

    def close_session(self, session_id: str, commit: bool = False) -> None:
        """Close an existing session

        Args:
            session_id (str): Session ID to close
            commit (bool, optional): Whether to commit changes
        """

        session = self.sessions.get(session_id)
        if not session:
            return

        if commit:
            session.commit()

        session.close()


SQL_CONN = SqliteConnection()
