import { createContext, useState, useEffect } from 'react';
const DEFAULT_VALUE = {"logged_in": false}
export const UserContext = createContext(DEFAULT_VALUE);

export const UserProvider = ({ children }) => {
    let [user, setUser] = useState(DEFAULT_VALUE)

    useEffect(() => {
        fetch('/api/user/')
        .then(res => res.json())
        .then(json => setUser(json))
    }, [])
    return(
        <UserContext.Provider value={user}>
            {children}
        </UserContext.Provider>
    )
}