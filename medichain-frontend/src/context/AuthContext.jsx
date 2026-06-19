import { createContext, useContext, useState, useEffect } from "react";
import api from "../api/axios";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // On app mount, try to restore session via refresh cookie
  useEffect(() => {
    async function restoreSession() {
      try {
        // Try to get a fresh access token using the httpOnly refresh cookie
        const refreshRes = await api.post("/auth/refresh-token");
        const newToken = refreshRes.data.accessToken;
        setAccessToken(newToken);
        localStorage.setItem("accessToken", newToken);

        // Fetch user profile with the new token
        const meRes = await api.get("/auth/me", {
          headers: { Authorization: `Bearer ${newToken}` },
        });
        setUser(meRes.data.user);
      } catch {
        // No valid session — user must log in
        setUser(null);
        setAccessToken(null);
      } finally {
        setLoading(false);
      }
    }
    restoreSession();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, accessToken, setAccessToken, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
