from flask import Blueprint, request
from urllib.parse import urlencode, quote
import requests

bp = Blueprint("words", __name__, url_prefix='/words/')

@bp.route('search', methods=["GET"])
def search():
    pattern = request.args.get("pattern", None)
    if not pattern:
        words = []
    else:
        params = urlencode({
            "sp": pattern,
            "max": 50,
        })
        data = requests.get(f"https://api.datamuse.com/words?{params}").json()
        print(data)
        words = list(filter(lambda w: w["score"] > 250, data))[:20]

    if len(words) == 0:
        return {"words":[]}, 404
    else:
        return {"words": words}