from flask import Blueprint, g, request
from api.decorators import login_required
from api.database import get_db_session
from api.database.solution import Solution

from sqlalchemy.orm import selectinload

bp = Blueprint('solution', __name__, url_prefix='/api/solution')

@bp.route('/<int:solution_id>', methods=['PATCH'])
@login_required
def patch_solution(solution_id: int):
    with get_db_session() as db_session:
        solution = db_session.get(Solution, solution_id, options=[selectinload(Solution.puzzle)])
        if not solution:
            return {"errors": ["Solution not Found"], "status": 404}, 404
        if solution.user_id != g.user_id:
            return {"errors": ["Forbidden", "You do not have access to this solution"], "status": 403}, 403

        try:
            new_user_solution = request.json["user_solution"]
            solved = request.json["is_solved"]
        except KeyError as err:
            print(err)
            return {"errors": ["Bad request", f"Request missing key: {err}"], "status": 400}, 400
        
        # validate solution
        if not (
            len(new_user_solution) == solution.puzzle.num_rows
            and all(map(lambda r: len(r) == solution.puzzle.num_cols, new_user_solution))
        ):
            return  {"errors": ["Solution length invalid"], "status": 400}, 400

        solution.user_answers = new_user_solution
        solution.correct = solved
        db_session.commit()

    return {"solution_id": solution_id}