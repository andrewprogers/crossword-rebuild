from api.database.puzzle import Puzzle

def test_grid_from_iterable__generates_square():
    arr = list(range(9))
    g1 = Puzzle.grid_from_iterable(arr, 3, 3)
    assert len(g1) == 3
    assert len(g1[0]) == 3
    assert g1[1][2] == 5

# nonsquare
def test_grid_from_iterable__generates_nonsquare():
    arr = list(range(12))
    g2 = Puzzle.grid_from_iterable(arr, 3, 4)
    assert len(g2) == 3
    assert len(g2[0]) == 4
    assert g2[1][1] == 5

def test_grid_from_iterable__raises_on_short_input():
    caught = False
    try:
        g2 = Puzzle.grid_from_iterable(range(5), 3, 3)
    except ValueError:
        caught = True
    assert caught

def test_grid_from_iterable__raises_on_overlong_input():
    caught = False
    try:
        g2 = Puzzle.grid_from_iterable(range(10), 3, 3)
    except ValueError:
        caught = True
    assert caught





