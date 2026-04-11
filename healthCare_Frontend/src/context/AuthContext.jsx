import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("token") || null);
  const [role,  setRole]  = useState(() => localStorage.getItem("role")  || null);
  const [user,  setUser]  = useState(() => {
    try { return JSON.parse(localStorage.getItem("user")) || null; }
    catch { return null; }
  });

  const login = (token, role, userData) => {
    localStorage.setItem("token", token);
    localStorage.setItem("role",  role);
    if (userData) localStorage.setItem("user", JSON.stringify(userData));
    setToken(token); setRole(role); setUser(userData);
  };

  const logout = () => {
    localStorage.clear();
    setToken(null); setRole(null); setUser(null);
  };

  return (
    <AuthContext.Provider value={{ token, role, user, login, logout, isAuth: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);