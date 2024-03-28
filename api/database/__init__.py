from sqlalchemy import create_engine
from sqlalchemy.orm import scoped_session, sessionmaker, Session
from flask import Flask, g, current_app

from . import base
from . import puzzle
from . import user


def init_db(app: Flask) -> scoped_session:
    engine = create_engine(app.config["DATABASE_URI"], echo=False)

    # controls how sessions are created when requested from the registry
    factory = sessionmaker(autocommit=False, expire_on_commit=False, bind=engine)

    # scoped_session is a session registry returning a thread-local session
    return scoped_session(factory)

def get_db_session() -> Session:
    if 'db' not in g:
        g.db = current_app.config["DB_SESSION"]
    return g.db()