import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

axios.defaults.withCredentials = true;

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // null=loading, false=not authed, object=authed

  const checkAuth = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API}/auth/me`, { withCredentials: true });
      setUser(data);
    } catch {
      setUser(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = useCallback(async (email, password) => {
    const { data } = await axios.post(`${API}/auth/login`, { email, password }, { withCredentials: true });
    setUser(data);
    return data;
  }, []);

  const logout = useCallback(async () => {
    await axios.post(`${API}/auth/logout`, {}, { withCredentials: true });
    setUser(false);
  }, []);

  const refreshUser = useCallback(() => checkAuth(), [checkAuth]);

  const value = useMemo(
    () => ({ user, login, logout, refreshUser, setUser }),
    [user, login, logout, refreshUser]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
export { API };
