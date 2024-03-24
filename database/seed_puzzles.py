from sqlalchemy import create_engine
from sqlalchemy.orm import Session
from os.path import dirname, join, abspath
import sys
import json
import glob
import random
import datetime as dt


def get_engine(config_file = "../instance/config_dev.py"):
    config_path = abspath(join(dirname(__file__), config_file))
    config_dict = dict()
    with open(config_path, mode="rb") as config_file:
        exec(compile(config_file.read(), config_path, "exec"), config_dict)

    DATABASE_URI = config_dict["DATABASE_URI"]
    return create_engine(DATABASE_URI, echo=True)

def sample_crosswords(num = 10):
    def is_square(xword_json):
        return xword_json["size"]["rows"] == xword_json["size"]["cols"]

    def contains_rebus(xword_json):
        return(any(map(lambda g: len(g) > 1, xword_json["grid"])))

    file_paths = glob.glob("./database/seed_data/**/*.json", recursive=True)
    random.shuffle(file_paths)
    crosswords = []

    for path in file_paths:
        try:
            with open(path, 'r') as file:
                data = json.load(file)
                if is_square(data) and not contains_rebus(data):
                    crosswords.append(data)
                    if len(crosswords) == num:
                        break
        except Exception:
            print(f"Failed to process file: '{path}'")
            pass
    return crosswords

def answers_from_json(data):
    for dir in ["across", "down"]:
        for (clue, answer) in zip(data["clues"][dir], data["answers"][dir]):
            i = clue.find(". ")
            gridnum = int(clue[:i])
            clue_text = clue[i+2:]
            yield Answer(
                is_across=(dir=="across"),
                gridnum=gridnum,
                clue=clue_text,
                answer=answer
            )

def puzzle_from_json(data):
    p = Puzzle(
        user_id=None,
        title=data["title"],
        num_rows=data["size"]["rows"],
        num_cols=data["size"]["cols"],
        grid = {"grid": data["grid"]},
        date=dt.datetime.strptime(data["date"], "%m/%d/%Y").date(),
        notes=(data["jnotes"] or data["notepad"]),
        draft=False
    )
    p.answers.extend(answers_from_json(data))
    return p


# allow import from api directory since this file is not in that package
sys.path.append(abspath(join(dirname(__file__), "../")))
from api.database.puzzle import Puzzle, Answer

if len(sys.argv) > 1:
    eng = get_engine(sys.argv[1])
else:
    eng = get_engine()

with Session(bind=eng) as session:
    for data in sample_crosswords(10):
        session.add(puzzle_from_json(data))
    session.commit()
    