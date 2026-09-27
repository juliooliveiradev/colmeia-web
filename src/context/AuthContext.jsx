import { createContext, useContext, useMemo, useState } from "react";
import { api, clearSession, getStoredUser, getToken, setSession } from "../api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getStoredUser);
  const [token, setToken] = useState(getToken);

  const value = useMemo(
    () => ({
      user,
      token,
      async login(email, password) {
        const data = await api.login(email, password);
        setSession(data.access_token, data.user);
        setToken(data.access_token);
        setUser(data.user);
      },
      async register(payload) {
        const data = await api.register(payload);
        setSession(data.access_token, data.user);
        setToken(data.access_token);
        setUser(data.user);
      },
      logout() {
        clearSession();
        setToken(null);
        setUser(null);
      },
    }),
    [user, token]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
