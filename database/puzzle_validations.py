
import json
import glob
from collections import defaultdict

counts = defaultdict(int)
examples = []

file_paths = glob.iglob("./database/seed_data/**/*.json", recursive=True)
for path in sorted(file_paths):
    with open(path, 'r') as file:
        data = json.load(file)

        counts["all"] += 1

        grid = data["grid"]
        if not all(map(lambda g: len(g) == 1, grid)):
            counts["has_rebus"] += 1

        if any(map(lambda g: g == ' ', grid)):
            counts["grid_has_blanks"] += 1

        if any(map(lambda c: not ((ord('A') <= ord(c) <= ord('Z')) or c in "\"/',-.&$!#1234567890= " ) ,''.join(grid))):
            counts["grid_has_unexpected_chars"] += 1

        if data["size"]["rows"] != data["size"]["cols"]:
            counts["nonsquare"] += 1

        area = data["size"]["rows"] * data["size"]["cols"]
        if area != len(grid) or area != len(data["gridnums"]):
            counts["area_mismatch"] += 1

        if (
            len(data["clues"]["across"]) != len(data["answers"]["across"]) or
            len(data["clues"]["down"]) != len(data["answers"]["down"])
        ):
            counts["clue_answer_mismatch"] += 1
        
        if not data["editor"]:
            counts["editor_missing"] += 1

        if data["interpretcolors"]:
            # doesn't seem to actually do anything in the online puzzle, at least first example checked
            counts["interpretcolors"] += 1

        if data["jnotes"]:
            counts["jnotes"] += 1

        if data["notepad"]:
            counts["notepad"] += 1

        if data["notepad"] and "PDF" in data["notepad"]:
            counts["pdf_recommended"] += 1

        if data["shadecircles"]:
            counts["shadecircles"] += 1

        if data["track"]:
            counts["track"] += 1

        if data["type"]:
            counts["type"] += 1
        


print(json.dumps(counts, indent=2))


## things that are "wrong":
    # puzzles can have non square grids
    # grid elements can have more than one letter (rebus answers)
    # grid elements can contain capital letter, numbers, certain punct. marks

# actually wrong:
    # puzzle for 4/5/2017 contains Ã‘ instead on Ñ character

## unused fields:
    # acrossmap
    # admin
    # code
    # downmap
    # hold
    # id
    # id2
    # key
    # rbars
    # track
    # type

## things validated as correct:
    # num clues and answers always match
    # grid elements are always at least 1 (possible space) character

