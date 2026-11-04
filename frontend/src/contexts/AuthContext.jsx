import { createContext, useCallback, useContext, useState } from "react";

const AuthContext = createContext();
const USER_KEY = "brasaBranca:user";

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        const storedUser = localStorage.getItem(USER_KEY);
        return storedUser ? JSON.parse(storedUser) : null;
    });

    const login = useCallback((usuario) => {
        setUser(usuario);
        localStorage.setItem(USER_KEY, JSON.stringify(usuario));
    }, []);

    const logout = useCallback(() => {
        setUser(null);
        localStorage.removeItem(USER_KEY);
    }, []);

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
