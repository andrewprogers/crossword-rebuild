from sqlalchemy import create_engine
from sqlalchemy.orm import scoped_session, sessionmaker, Session
from flask import Flask, g

from . import base
from . import puzzle
from . import user


def init_db(app: Flask) -> scoped_session:
    engine = create_engine(app.config["DATABASE_URI"], echo=True)

    # controls how sessions are created when requested from the registry
    factory = sessionmaker(autocommit=False, expire_on_commit=False, bind=engine)

    # scoped_session is a session registry returning a thread-local session
    return scoped_session(factory)

def get_db_session() -> Session:
    return g.db()