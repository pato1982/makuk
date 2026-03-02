import { createContext, useContext, useState, useCallback } from 'react';

const AuthContext = createContext();
const AUTH_KEY = 'makuk_auth';

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem(AUTH_KEY) === 'true';
  });

  const login = useCallback((email, password) => {
    const validUser = import.meta.env.VITE_ADMIN_USER || 'admin@makuk.cl';
    const validPass = import.meta.env.VITE_ADMIN_PASS || 'makuk2024';
    if (email === validUser && password === validPass) {
      localStorage.setItem(AUTH_KEY, 'true');
      setIsAuthenticated(true);
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_KEY);
    setIsAuthenticated(false);
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
}
