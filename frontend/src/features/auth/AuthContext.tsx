import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

import { fetchMe, loginAsDemo, loginUser, registerUser, type RegisterPayload, type User } from "@/api/auth";
import { tokenStore } from "@/api/tokenStore";

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  demoLogin: () => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  async function bootstrap() {
    const refreshToken = tokenStore.getRefreshToken();
    if (!refreshToken) {
      setIsLoading(false);
      return;
    }
    try {
      const me = await fetchMe();
      setUser(me);
    } catch {
      tokenStore.clear();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    bootstrap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function login(email: string, password: string) {
    const { access, refresh } = await loginUser(email, password);
    tokenStore.setAccessToken(access);
    tokenStore.setRefreshToken(refresh);
    const me = await fetchMe();
    setUser(me);
  }

  async function demoLogin() {
    const { access, refresh, user: demoUser } = await loginAsDemo();
    tokenStore.setAccessToken(access);
    tokenStore.setRefreshToken(refresh);
    setUser(demoUser);
  }

  async function register(payload: RegisterPayload) {
    const { access, refresh, user: newUser } = await registerUser(payload);
    tokenStore.setAccessToken(access);
    tokenStore.setRefreshToken(refresh);
    setUser(newUser);
  }

  function logout() {
    tokenStore.clear();
    setUser(null);
  }

  async function refreshUser() {
    const me = await fetchMe();
    setUser(me);
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, demoLogin, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
