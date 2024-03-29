export const debounce = (func, msDelay) => {
    let timeout = null;

    return (...args) => {
        if (timeout != null) {
            clearTimeout(timeout)
        }
        timeout = setTimeout(() => {
            timeout = null
            func(...args)
        }, msDelay)
    }
}

export function* grid_iter(grid) {
    for (var r = 0; r < grid.length; r++)
    for (var c = 0; c < grid[r].length; c++)
        yield {r, c, el: grid[r][c]}
  }