import os

from flask import Flask, g, session
# from .database import init_db, get_db_session
# from .database.models import TodoList, TodoListEncoder
# from sqlalchemy import select
# from api.blueprints import todo_list
from api.blueprints.auth import init_auth
import datetime as dt

def create_app(test_config=None):
    # create and configure the app
    app = Flask(__name__, instance_relative_config=True)

    if test_config is None:
        # load the proper instance config, if it exists, when not testing
        if os.getenv("FLASK_ENV") == "PRODUCTION":
            print("Running with PRODUCTION configuration")
            app.config.from_pyfile('config_prod.py')
        elif os.getenv("FLASK_ENV") == "STAGING":
            print("Running with STAGING configuration")
            app.config.from_pyfile('config_staging.py')
        else:
            print("Running with DEVELOPMENT configuration")
            app.config.from_pyfile('config_dev.py')
    else:
        # load the test config if passed in
        app.config.from_mapping(test_config)

    # db_session = init_db(app)
    init_auth(app)

    @app.route("/") # dummy route for use with url_for
    def home():
        pass
    
    @app.before_request
    def begin_db_session():
        ## check user session validity
        user = session.get("user")
        if user:
            exp = user["userinfo"]["exp"]
            if dt.datetime.fromtimestamp(exp, dt.timezone.utc) <= dt.datetime.now(dt.timezone.utc):
                # users session has expired, so log them out here as well
                session.clear()

        ## set db variable for request
        # g.db = db_session
    
    @app.teardown_request
    def teardown_db_session(err = None):
        if "db" in g:
            g.db.remove()

    # app.register_blueprint(todo_list.bp)

    return app