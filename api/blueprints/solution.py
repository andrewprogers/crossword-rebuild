from flask import Blueprint, g, request
from api.decorators import login_required
from api.database import get_db_session
from api.database.solution import Solution
from flask_expects_json import expects_json
from api.blueprints import schemas

from sqlalchemy.orm import selectinload

bp = Blueprint('solution', __name__, url_prefix='/solution')

@bp.route('/<int:solution_id>', methods=['PATCH'])
@login_required
@expects_json({
    "type": "object",
    "properties": {
        "user_solution": schemas.grid,
        "is_solved": {"type": "boolean"}
    }
})
def patch_solution(solution_id: int):
    with get_db_session() as db_session:
        solution = db_session.get(Solution, solution_id, options=[selectinload(Solution.puzzle)])
        if not solution:
            return {"errors": ["Solution not Found"], "status": 404}, 404
        if solution.user_id != g.user_id:
            return {"errors": ["Forbidden", "You do not have access to this solution"], "status": 403}, 403
        
        # validate solution
        if not solution.puzzle.valid_grid_size(g.data["user_solution"]):
            return  {"errors": ["Solution length invalid"], "status": 400}, 400

        solution.user_answers = g.data["user_solution"]
        solution.correct = g.data["is_solved"]
        db_session.commit()

    return {"solution_id": solution_id}