from typing import List, Iterable

def grid_from_iterable(iterable: Iterable[str], rows:int, cols:int) -> List[List[str]]:
    it = iter(iterable)
    try:
        grid = [[next(it) for _ in range (cols)] for _ in range(rows)]
        if next(it, None) is None:
            return grid
        raise ValueError("Iterable length greater than rows*cols")
    except StopIteration:
        raise ValueError("Iterable length less than rows*cols")

def generate_blank_grid(rows: int, cols: int):
    return grid_from_iterable(('' for _ in range(rows*cols)), rows, cols)

# square input
arr = list(range(9))
g1 = grid_from_iterable(arr, 3, 3)
assert len(g1) == 3
assert len(g1[0]) == 3
assert g1[0][0] == 0
assert g1[1][1] == 4
assert g1[2][2] == 8

# nonsquare
arr = list(range(12))
g2 = grid_from_iterable(arr, 3, 4)
assert len(g2) == 3
assert len(g2[0]) == 4
assert g2[0][0] == 0
assert g2[1][1] == 5
assert g2[2][2] == 10

caught = False
try:
    g2 = grid_from_iterable(range(5), 3, 3)
except ValueError:
    caught = True
assert caught


caught = False
try:
    g2 = grid_from_iterable(range(10), 3, 3)
except ValueError:
    caught = True
assert caught


print (generate_blank_grid(3,10))



