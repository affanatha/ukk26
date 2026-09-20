"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import {
  getProfile,
  getToken,
  getCookie,
  setCookie,
  clearSession,
  login as loginRequest,
  logout as logoutRequest,
  USER_KEY,
  type LoginPayload,
  type User,
} from "./api";

type AuthState = {
  user: User | null;
  loading: boolean;
  login: (payload: LoginPayload) => Promise<User>;
  logout: () => void;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

function readCachedUser(): User | null {
  if (typeof window === "undefined") return null;
  let cached = window.localStorage.getItem(USER_KEY);
  if (!cached) {
    cached = getCookie(USER_KEY);
    if (cached) {
      window.localStorage.setItem(USER_KEY, cached);
    }
  }
  if (!cached) return null;
  try {
    return JSON.parse(cached) as User;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const profile = await getProfile();
      setUser(profile);
      const profileJson = JSON.stringify(profile);
      window.localStorage.setItem(USER_KEY, profileJson);
      setCookie(USER_KEY, profileJson, 7);
    } catch (err: any) {
      // Hanya hapus sesi jika backend merespons 401 Unauthorized (token hangus / tidak valid)
      if (err?.status === 401) {
        clearSession();
        setUser(null);
      } else {
        console.warn("Could not refresh profile, keeping cached user session:", err);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setUser(readCachedUser());
    refresh();
  }, [refresh]);

  const login = useCallback(async (payload: LoginPayload) => {
    const loggedIn = await loginRequest(payload);
    setUser(loggedIn);
    return loggedIn;
  }, []);

  const logout = useCallback(() => {
    logoutRequest();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, logout, refresh }),
    [user, loading, login, logout, refresh]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth harus dipakai di dalam <AuthProvider>.");
  }
  return context;
}

/**
 * Mengunci halaman untuk role tertentu.
 * Mengembalikan `ready = false` selagi sesi masih diperiksa.
 */
export function useRequireAuth(roles?: string[]) {
  const { user, loading } = useAuth();
  const router = useRouter();

  const isAllowed = useMemo(() => {
    if (!user) return false;
    if (!roles || roles.length === 0) return true;

    const userRole = (user.role || "").toLowerCase();
    return roles.some((r) => {
      const allowedRole = r.toLowerCase();
      if (userRole === allowedRole) return true;
      if (
        (allowedRole === "admin" || allowedRole === "admin_space") &&
        (userRole === "admin" || userRole === "admin_space")
      ) {
        return true;
      }
      return false;
    });
  }, [user, roles]);

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace("/auth/Login");
      return;
    }

    if (roles && roles.length > 0 && !isAllowed) {
      const isAdmin = user.role === "admin" || user.role === "admin_space";
      router.replace(isAdmin ? "/admin" : "/member");
    }
  }, [user, loading, roles, isAllowed, router]);

  return { user, ready: !loading && isAllowed };
}
