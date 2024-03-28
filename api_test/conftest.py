import sys
from os.path import dirname, join, abspath
import glob
import pytest
from sqlalchemy import create_engine, text
from contextlib import contextmanager
from uuid import uuid1

from flask import g, session

@contextmanager
def get_test_database(server: str, db_prefix: str='test_', migrations_glob: str=None):
    postgres = server + 'postgres'
    db_name = db_prefix + str(uuid1()).replace('-', '')
    with create_engine(postgres, echo=False).connect().execution_options(isolation_level='AUTOCOMMIT') as conn:
        query_create = text(f'create database "{db_name}";')
        conn.execute(query_create)
        conn.close()
        
    test_db_connection_string = (server + db_name)

    if migrations_glob:
        engine = create_engine(test_db_connection_string, echo=False)
        with engine.connect() as c2:
            for migration in sorted(glob.glob(migrations_glob)):
                script = text(open(migration).read())
                c2.execute(script)
            c2.commit()
        engine.dispose() # close any connections before dropping database later

    yield test_db_connection_string

    with create_engine(postgres, echo=False).connect().execution_options(isolation_level='AUTOCOMMIT') as conn:
        stop_connections = text(f'''
            -- stop further connections
            alter database "{db_name}" allow_connections = off;

            -- Drop remaining (except this connection)
            select pg_terminate_backend(pid)
            from pg_stat_activity
            where datname = '{db_name}'
                and pid <> pg_backend_pid();
        ''')
        conn.execute(stop_connections)
        conn.execute(text('drop database if exists "{db_name}";'))
            

sys.path.append(abspath(join(dirname(__file__), "../")))
from api import create_app
from api.database import get_db_session
from api.database.user import User

DATABASE_SERVER='postgresql+psycopg://postgres@localhost/'

@pytest.fixture
def test_config():
    with get_test_database(DATABASE_SERVER, "xword_test_", migrations_glob='./database/migrations/*') as db_uri:
        yield {
            'TESTING': True,
            'DATABASE_URI': db_uri,
            'AUTH0_DOMAIN':"dev-g5pdnglxbyjtwidp.us.auth0.com",
            'AUTH0_CLIENT_ID':"",
            'AUTH0_CLIENT_SECRET':"",
            'SECRET_KEY':'test'

        }


@pytest.fixture
def app(test_config):
    app = create_app(test_config)
    with app.app_context():
        with get_db_session() as db_session:
            db_session.add(User(
                id="fake|auth0id",
                email="test@gmail.com",
                given_name="Test",
                family_name="User",
                picture_url=None
            ))
            db_session.commit()

    yield app

@pytest.fixture
def client(app):
    return app.test_client()

@pytest.fixture
def runner(app):
    return app.test_cli_runner()