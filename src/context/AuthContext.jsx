import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { loginApi, logoutApi, getMe } from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Al montar, limpiar auth viejo y verificar si hay un token válido
  useEffect(() => {
    localStorage.removeItem('makuk_auth'); // Limpiar sistema viejo

    const token = localStorage.getItem('makuk_access_token');
    if (!token) {
      setLoading(false);
      return;
    }
    getMe()
      .then(() => setIsAuthenticated(true))
      .catch(() => setIsAuthenticated(false))
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email, password) => {
    const user = await loginApi(email, password);
    setIsAuthenticated(true);
    return user;
  }, []);

  const logout = useCallback(async () => {
    await logoutApi();
    setIsAuthenticated(false);
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, loading, login, logout }}>
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
