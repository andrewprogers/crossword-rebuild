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