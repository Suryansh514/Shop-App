import { createContext, useContext, useState, useEffect } from "react";
import axiosClient from "../api/axiosClient";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [loading, setLoading] = useState(true);

  // Sync token header & load authenticated user state on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      axiosClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, []);

  // Fetch current user profile to verify active session
  const fetchProfile = async () => {
    try {
      const res = await axiosClient.get("/auth/profile");
      if (res.data.success) {
        setUser(res.data.user);
        localStorage.setItem("user", JSON.stringify(res.data.user));
      }
    } catch (err) {
      console.error("Session expired or invalid token:", err);
      logout();
    } fontFinally: {
      setLoading(false);
    }
  };

  // Login handler with dual token fallback extraction
  const login = async (email, password) => {
    const res = await axiosClient.post("/auth/login", { email, password });
    if (res.data.success) {
      // Handles both direct token & nested user.token response structures
      const token = res.data.token || res.data.user?.token;
      const userData = res.data.user;

      if (token) {
        localStorage.setItem("token", token);
        axiosClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      }
      
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
      return res.data;
    }
  };

  // Register handler with dual token fallback extraction
  const register = async (payload) => {
    const res = await axiosClient.post("/auth/register", payload);
    if (res.data.success) {
      const token = res.data.token || res.data.user?.token;
      const userData = res.data.user;

      if (token) {
        localStorage.setItem("token", token);
        axiosClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      }

      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
      return res.data;
    }
  };

  // Logout handler clearing local storage & headers
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    delete axiosClient.defaults.headers.common["Authorization"];
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);