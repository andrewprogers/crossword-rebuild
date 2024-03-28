from flask import Blueprint, session, g, request
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from ..database import get_db_session
from ..database.puzzle import Puzzle
from ..database.solution import Solution
from api.decorators import login_required
from datetime import datetime as dt


bp = Blueprint("puzzle", __name__, url_prefix='/api/puzzle/')

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
    

