import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import * as api from "../lib/api";
import { getAuthHeaders } from "../lib/api";

const TOKEN_KEY = "lojinha_token";
const USER_KEY = "lojinha_user";
const COOKIE_NAME = "lojinha_logged_in";
const COOKIE_MAX_AGE_DAYS = 7;

function setLoggedInCookie(token: string) {
  document.cookie = `${COOKIE_NAME}=1; path=/; max-age=${60 * 60 * 24 * COOKIE_MAX_AGE_DAYS}; SameSite=Lax`;
}

function clearLoggedInCookie() {
  document.cookie = `${COOKIE_NAME}=; path=/; max-age=0`;
}

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: "user" | "admin";
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isLoading: true,
  isAdmin: false,
  login: async () => {},
  register: async () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    const storedUser = localStorage.getItem(USER_KEY);

    // Se existir token armazenado, validar com o back.
    // Caso esteja inválido/expirado (ou secret mudou entre execuções),
    // limpamos localStorage e pedimos novo login.
    const API_BASE =
      import.meta.env.VITE_API_URL ||
      (import.meta.env.DEV ? "" : "http://localhost:3000");

    async function validateToken(tokenToValidate: string): Promise<boolean> {
      try {
        const res = await fetch(`${API_BASE}/protected`, {
          headers: getAuthHeaders(tokenToValidate),
        });
        return res.ok;
      } catch {
        return false;
      }
    }

    async function init() {
      if (!storedToken || !storedUser) {
        setIsLoading(false);
        return;
      }

      try {
        const ok = await validateToken(storedToken);
        if (!ok) throw new Error("Token inválido");

        const parsedUser = JSON.parse(storedUser) as AuthUser;
        setToken(storedToken);
        setUser(parsedUser);
        setLoggedInCookie(storedToken);
      } catch {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        clearLoggedInCookie();
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }

    void init();
  }, []);

  const validateTokenOnLogin = useCallback(async (tokenToValidate: string) => {
    const API_BASE =
      import.meta.env.VITE_API_URL ||
      (import.meta.env.DEV ? "" : "http://localhost:3000");
    const res = await fetch(`${API_BASE}/protected`, {
      headers: getAuthHeaders(tokenToValidate),
    });
    if (!res.ok) throw new Error("Token inválido");
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await api.login(email, password);

    // Garante que o token recebido do back é válido antes de liberar o restante do app.
    await validateTokenOnLogin(res.token);

    setToken(res.token);
    setUser(res.user);
    localStorage.setItem(TOKEN_KEY, res.token);
    localStorage.setItem(USER_KEY, JSON.stringify(res.user));
    setLoggedInCookie(res.token);
  }, [validateTokenOnLogin]);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const res = await api.register(name, email, password);
    // Após cadastro o back não retorna token; fazer login para obter sessão
    await login(email, password);
  }, [login]);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    clearLoggedInCookie();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAdmin: user?.role === "admin",
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
