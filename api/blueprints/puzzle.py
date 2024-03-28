from flask import Blueprint, session
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from ..database import get_db_session
from ..database.puzzle import Puzzle
from ..database.solution import Solution


bp = Blueprint("puzzle", __name__, url_prefix='/api/puzzle/')

def current_user_id():
    user = session.get("user")
    if not user:
        return None
    else:
        return user["userinfo"]["sub"]

@bp.route("/<int:puzzle_id>")
def show(puzzle_id: int):
    with get_db_session() as db_session:
        puzzle = db_session.get(Puzzle, puzzle_id, options=[selectinload(Puzzle.answers)])

    if not puzzle:
        return {"errors": ["Puzzle not Found"], "status": 404}, 404
    
    if puzzle.draft:
        if not current_user_id():
            return {"errors": ["Not authorized"], "status": 401}, 401
        elif puzzle.user_id != current_user_id():
            return {"errors": ["Not authorized", "Puzzle not publicly available"], "status": 403}, 403
        else:
            return { "puzzle": puzzle.to_dict() }
    
    response = { "puzzle": puzzle.to_dict() }

    if current_user_id():
        # try to find solution
        with get_db_session() as db_session:
            query = (select(Solution)
                     .where(Solution.puzzle_id==puzzle_id)
                     .where(Solution.user_id==current_user_id())
                     .limit(1)
            )
            solution = db_session.scalar(query)
            if not solution:
                solution = Solution(
                    user_id=current_user_id(), 
                    puzzle_id=puzzle.id,
                    user_answers=puzzle.generate_blank_solution()
                    )
                db_session.add(solution)
                db_session.commit()

        response["solution"] = {
            "id": solution.id,
            "user_id": solution.user_id,
            "user_answers": solution.user_answers,
            "is_solved": solution.correct
        }
            
    return response
