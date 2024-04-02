from flask import Blueprint, session, g, request, redirect, url_for
from flask_expects_json import expects_json
from jsonschema import ValidationError
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy.sql.expression import func 
from ..database import get_db_session
from ..database.puzzle import Puzzle
from ..database.answer import Answer
from ..database.user import User
from ..database.solution import Solution
from api.decorators import login_required
from datetime import datetime as dt
from api.blueprints import schemas


bp = Blueprint("puzzle", __name__, url_prefix='/puzzle/')

def map_puzzle(res):
    user_name = None
    if (res.given_name):
        user_name = f"{res.given_name} {res.family_name}"
    return {
        "id": res.id,
        "url": f"/puzzles/{res.id}",
        "title": res.title,
        "user_name": user_name
    }

index_base = (
    select(Puzzle.id, Puzzle.title, User.given_name, User.family_name)
    .join(User, Puzzle.user_id == User.id, isouter=True)
    .limit(20).order_by(Puzzle.updated_at.desc())
)

@bp.route('/', methods=["GET"])
def index():
    with get_db_session() as db_session:
        results = db_session.execute(index_base.where(Puzzle.draft==False)).fetchall()
    return {
        "recent": [map_puzzle(res) for res in results]
    }
    
@bp.route('/user', methods=["GET"])
@login_required
def user_index():
    with get_db_session() as db_session:
        created = db_session.execute(index_base.where(Puzzle.user_id==g.user_id, Puzzle.draft==False)).fetchall()
        draft = db_session.execute(index_base.where(Puzzle.user_id==g.user_id, Puzzle.draft==True)).fetchall()
        in_progress = db_session.execute(
            index_base
            .join(Solution, Solution.puzzle_id==Puzzle.id)
            .where(Solution.user_id==g.user_id, Solution.correct==False)
            .order_by(None).order_by(Solution.updated_at.desc())
        )
    return {
        "user_id": g.user_id,
        "created": list(map(map_puzzle, created)),
        "draft": list(map(map_puzzle, draft)),
        "in_progress": list(map(map_puzzle, in_progress))
    }
            
            
@bp.route('/create', methods=["POST"])
@login_required
@expects_json({
    'type': 'object',
    'properties': {
        'title': schemas.puzzle_title,
        'size': {'type': 'integer', "minimum": 5, "maximum": 25},
    },
    'required': ['title', 'size']
})
def create_puzzle():
    with get_db_session() as db_session:
        puzzle = Puzzle.new_draft(g.user_id, g.data["title"], g.data["size"])
        db_session.add(puzzle)
        db_session.commit()

    return { "puzzle_id": puzzle.id }

@bp.route("/random", methods=["GET"])
def random():
    with get_db_session() as db_session:
        query = (
            select(Puzzle.id).where(Puzzle.draft==False)
            .order_by(func.random()).limit(1)
        )
        rand_puzzle_id = db_session.scalar(query)
    return redirect(url_for('api.puzzle.show', puzzle_id=rand_puzzle_id))

@bp.route("/<int:puzzle_id>", methods=["GET"])
def show(puzzle_id: int):
    with get_db_session() as db_session:
        puzzle = db_session.get(Puzzle, puzzle_id, options=[selectinload(Puzzle.answers)])

    if not puzzle:
        return {"errors": ["Puzzle not Found"], "status": 404}, 404
    
    if puzzle.draft:
        if not g.user_id:
            return {"errors": ["Not authorized"], "status": 401}, 401
        elif puzzle.user_id != g.user_id:
            return {"errors": ["Not authorized", "Puzzle not publicly available"], "status": 403}, 403
        else:
            return { "puzzle": puzzle.to_dict() }
    
    response = { "puzzle": puzzle.to_dict() }

    if g.user_id:
        # try to find solution
        with get_db_session() as db_session:
            query = (select(Solution)
                     .where(Solution.puzzle_id==puzzle_id)
                     .where(Solution.user_id==g.user_id)
                     .limit(1)
            )
            solution = db_session.scalar(query)
            if not solution:
                solution = Solution(
                    user_id=g.user_id, 
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

@bp.route('/<int:puzzle_id>', methods=['PATCH'])
@login_required
@expects_json({
    "type": "object",
    "properties": {
        "grid_update": schemas.grid,
        "title_update": schemas.puzzle_title,
        "clues_update": schemas.clues
    },
    "required": ["grid_update", "title_update", "clues_update"]
})
def update_puzzle(puzzle_id: int):
    with get_db_session() as db_session:
        puzzle = db_session.get(Puzzle, puzzle_id)

        if not puzzle:
            return {"errors": ["Puzzle not Found"], "status": 404}, 404
        if not puzzle.draft:
            return {"errors": ["Puzzle not a draft"], "status": 400}, 400
        if puzzle.user.id != g.user_id:
            return {"errors": ["Not authorized", "Puzzle not publicly available"], "status": 403}, 403
    
        if not puzzle.valid_grid_size(g.data["grid_update"]):
            return  {"errors": ["Grid size invalid"], "status": 400}, 400
        
        puzzle.grid = {"grid": g.data["grid_update"]}
        puzzle.title = g.data["title_update"]
        puzzle.draft_clues = g.data["clues_update"]
        db_session.commit()

    return {"puzzle_id": puzzle_id}

@bp.route('/<int:puzzle_id>/publish', methods=['PATCH'])
@login_required
@expects_json({
    "type": "object",
    "properties": {
        "clue_numbers": schemas.clue_nums,
        "clue_answers": schemas.clue_answers
    },
    "required": ["clue_numbers", "clue_answers"]
})
def publish_puzzle(puzzle_id: int):
    with get_db_session() as db_session:
        puzzle = db_session.get(Puzzle, puzzle_id)

        if not puzzle:
            return {"errors": ["Puzzle not Found"], "status": 404}, 404
        if not puzzle.draft:
            return {"errors": ["Puzzle not a draft"], "status": 400}, 400
        if puzzle.user.id != g.user_id:
            return {"errors": ["Not authorized", "Puzzle not publicly available"], "status": 403}, 403
        
        if not puzzle.validate_draft(g.data["clue_numbers"], g.data["clue_answers"]):
            return {"errors": ["Unable to publish puzzle, bad format"], "status": 400}, 400
        
        puzzle.answers = [
            Answer(
                puzzle_id=puzzle.id,
                is_across=(d == 'across'),
                gridnum=num,
                clue=clue,
                answer=answer
            ) 
            for d in ('across', 'down')
            for (num, answer, clue) in zip(g.data["clue_numbers"][d], g.data["clue_answers"][d], puzzle.draft_clues[d])
        ]
        # puzzle.draft_clues = None
        puzzle.draft = False
        db_session.commit()
    return { "puzzle_id": puzzle_id }
        
        