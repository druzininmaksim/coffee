import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import api from '../api/client';

const TOKEN_KEY = 'token';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem(TOKEN_KEY);

        if (!token) {
            setLoading(false);

            return;
        }

        api.get('/user')
            .then(({ data }) => setUser(data.user))
            .catch(() => localStorage.removeItem(TOKEN_KEY))
            .finally(() => setLoading(false));
    }, []);

    const login = useCallback(async (email, password) => {
        const { data } = await api.post('/login', { email, password });

        localStorage.setItem(TOKEN_KEY, data.token);
        setUser(data.user);

        return data.user;
    }, []);

    const register = useCallback(async (payload) => {
        const { data } = await api.post('/register', payload);

        localStorage.setItem(TOKEN_KEY, data.token);
        setUser(data.user);

        return data.user;
    }, []);

    const logout = useCallback(async () => {
        try {
            if (localStorage.getItem(TOKEN_KEY)) {
                await api.post('/logout');
            }
        } catch {
            // Даже если запрос не прошёл, локально разлогиниваем пользователя.
        } finally {
            localStorage.removeItem(TOKEN_KEY);
            setUser(null);
        }
    }, []);

    const value = useMemo(
        () => ({
            user,
            loading,
            login,
            register,
            logout,
            isAuthenticated: Boolean(user),
            isAdmin: user?.role === 'admin',
        }),
        [user, loading, login, register, logout]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error('useAuth должен использоваться внутри AuthProvider');
    }

    return context;
}
