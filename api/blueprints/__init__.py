from . import auth, puzzle, solution, words
from flask import Blueprint
from jsonschema import ValidationError

api_bp = Blueprint('api', __name__, url_prefix='/api/')

@api_bp.errorhandler(400)
def handle_bad_request(error):
    errors = ["Bad Request"]
    if isinstance(error.description, ValidationError):
        errors.append(error.description.message)
    return { 
        "status": 400,
        "errors": errors
    }, 400

api_bp.register_blueprint(puzzle.bp)
api_bp.register_blueprint(solution.bp)
api_bp.register_blueprint(words.bp)
api_bp.register_blueprint(auth.user_bp)