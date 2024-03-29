from flask import Blueprint, session, g, request, redirect, url_for
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy.sql.expression import func 
from ..database import get_db_session
from ..database.puzzle import Puzzle
from ..database.user import User
from ..database.solution import Solution
from api.decorators import login_required
from datetime import datetime as dt

bp = Blueprint("puzzle", __name__, url_prefix='/api/puzzle/')

def map_puzzle(res):
    return {
        "id": res.id,
        "url": f"/puzzles/{res.id}",
        "title": res.title,
        "user_name": f"{res.given_name} {res.family_name}"
    }

index_base = (
    select(Puzzle.id, Puzzle.title, User.given_name, User.family_name)
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
            index_base.where(Solution.user_id==g.user_id, Solution.correct==False)
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
def create_puzzle():
    json = request.json
    if not json:
        return { "status": 400, "errors": ["Bad Request", "Missing json form data"]}, 400
    title = json["title"]
    size = int(json["size"])
    if len(title) < 1 or len(title) > 50:
        return { "status": 400, "errors": ["Bad Request", "Title must be between 1 and 50 characters"]}, 400
    if size < 5 or size > 25:
        return { "status": 400, "errors": ["Bad Request", "Puzzle size must be between 5-25"]}, 400
    
    with get_db_session() as db_session:
        puzzle = Puzzle.new_draft(g.user_id, title, size)
        db_session.add(puzzle)
        db_session.commit()

    return {
        "puzzle_id": puzzle.id
    }

@bp.route("/random", methods=["GET"])
def random():
    with get_db_session() as db_session:
        query = (
            select(Puzzle.id).where(Puzzle.draft==False)
            .order_by(func.random()).limit(1)
        )
        rand_puzzle_id = db_session.scalar(query)
    return redirect(url_for('puzzle.show', puzzle_id=rand_puzzle_id))

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
def update_puzzle(puzzle_id: int):
    with get_db_session() as db_session:
        puzzle = db_session.get(Puzzle, puzzle_id, options=[selectinload(Puzzle.answers)])

        if not puzzle:
            return {"errors": ["Puzzle not Found"], "status": 404}, 404
        if not puzzle.draft:
            return {"errors": ["Puzzle not a draft"], "status": 400}, 400
        if puzzle.user.id != g.user_id:
            return {"errors": ["Not authorized", "Puzzle not publicly available"], "status": 403}, 403
    
        if not puzzle.valid_grid_size(request.json["grid_update"]):
            return  {"errors": ["Grid size invalid"], "status": 400}, 400
        
        puzzle.grid = {"grid": request.json["grid_update"]}
        puzzle.title = request.json["title_update"]
        puzzle.draft_clues = request.json["clues_update"]
        db_session.commit()

    return {"puzzle_id": puzzle_id}



    # if puzzle.draft && flat_update.length == puzzle.size**2
    #   puzzle.grid = flat_update.join('')
    #   puzzle.title = params[:title_update]
    #   puzzle.title = puzzle.date.strftime('%A, %b %d') if puzzle.title == ""
    #   puzzle.draft_clues_json = params[:clues_update].to_json
    #   puzzle.save!
    #   render json: { grid: params[:grid_update] }, status: 200
    # else
    #   render json: {}, status: 404
    # end
    

