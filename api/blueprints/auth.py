from urllib.parse import quote_plus, urlencode
from flask import Flask, Blueprint, redirect, session, url_for, current_app
from authlib.integrations.flask_client import OAuth

from ..database import get_db_session
from ..database.user import User
from sqlalchemy import select


def init_auth(app: Flask):
    oauth = OAuth(app)
    domain = app.config["AUTH0_DOMAIN"]
    client_id = app.config["AUTH0_CLIENT_ID"]
    secret = app.config["AUTH0_CLIENT_SECRET"]

    oauth.register(
        "auth0",
        client_id=client_id,
        client_secret=secret,
        client_kwargs={
            "scope": "openid profile email",
        },
        server_metadata_url=f'https://{domain}/.well-known/openid-configuration'
    )

    return oauth

auth_bp = Blueprint("auth", __name__, url_prefix='/auth/')

@auth_bp.route("/login", methods=["GET"])
def login():
    if current_app.config.get("FLASK_ENV") == "DEVELOPMENT":
        callback_url = "https://10.0.0.72:3000" + url_for("auth.callback", _external=False)
    else:
        callback_url = url_for("auth.callback", _external=True)

    return current_app.config["OAUTH"].auth0.authorize_redirect(
        redirect_uri=callback_url
    )

@auth_bp.route("/callback", methods=["GET", "POST"])
def callback():
    token = current_app.config["OAUTH"].auth0.authorize_access_token()

    session["user"] = token

    with get_db_session() as db_session:
        user = db_session.get(User, token["userinfo"]["sub"])
        if not user:
            db_session.add(User.from_user_session(token))
            db_session.commit()

    return redirect("/")

@auth_bp.route("/logout", methods=["GET"])
def logout():
    if current_app.config["FLASK_ENV"] == "DEVELOPMENT":
        return_url = "https://10.0.0.72:3000" + url_for("home", _external=False)
    else:
        return_url = url_for("home", _external=True)

    session.clear()
    logout_params = urlencode(
        {
        "returnTo": return_url,
        "client_id": current_app.config["AUTH0_CLIENT_ID"],
        },
        quote_via=quote_plus,
    )

    logout_redirect = f"https://{current_app.config['AUTH0_DOMAIN']}/v2/logout?{logout_params}"
    return redirect(logout_redirect)

user_bp = Blueprint("user", __name__, url_prefix='/user')

@user_bp.route("/", methods=["GET"])
def current_user():
    user = session.get("user")
    
    if user:
        info = user["userinfo"]
        return {
            "logged_in": True,
            "email": info["email"],
            "user_id": info["sub"],
            "expires": info["exp"],
            "given_name": info["given_name"],
            "family_name": info["family_name"],
            "picture": info["picture"]
        }
    else:
        return {"logged_in": False}