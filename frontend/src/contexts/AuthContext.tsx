import React, { createContext, useCallback, useEffect, useState } from "react";
import { authAPI } from "../api/auth";
import type { LoginValues } from "../components/LoginForm";
import { toast } from "sonner";
import { AxiosError } from "axios";
import type { RegisterValues } from "../components/RegisterForm";
import { useNavigate, useLocation } from "react-router-dom";

export const AUTH_STORE_KEY = 'AUTH_DATA'

type AuthContextType = {
  user: LoggedInUser | null;
  login: (credentials: LoginValues) => Promise<void>;
  register: (payload: RegisterValues) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async () => {
    throw new Error("Not implemented yet")
  },
  register: async () => {
    throw new Error("Not implemented yet")
  },
  logout: () => { },
  isLoading: false,
})

export type IUser = {
  _id: string;
  username: string;
}

export type LoggedInUser = {
  accessToken: string;
  refreshToken: string;
} & IUser;


type AuthProviderProps = {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<LoggedInUser | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize auth state from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem(AUTH_STORE_KEY);
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Failed to parse stored user data", e);
        localStorage.removeItem(AUTH_STORE_KEY);
      }
    }
    setIsLoading(false);
  }, [])

  // Handle route protection and redirection
  useEffect(() => {
    if (isLoading) return;

    if (user) {
      // Redirect away from auth pages if logged in
      if (location.pathname.startsWith('/auth')) {
        navigate('/');
      }
    } else {
      // Redirect to auth page if not logged in and not already there
      if (!location.pathname.startsWith('/auth')) {
        navigate('/auth');
      }
    }
  }, [user, isLoading, location.pathname])

  const login = useCallback(async (credentials: LoginValues) => {
    setIsLoading(true);
    try {
      const response = await authAPI.login(credentials);
      if (response.status !== 200) {
        throw new Error(response.data.error || 'Login failed');
      }

      const { data } = response;
      localStorage.setItem(AUTH_STORE_KEY, JSON.stringify(data));
      setUser(data);
      toast.success("Login successful");
    } catch (error) {
      console.error(error);
      let errorMessage = (error as Error).message;
      if (error instanceof AxiosError) {
        errorMessage = error.response?.data?.error ?? errorMessage;
      }
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [])

  const register = useCallback(async (payload: RegisterValues) => {
    setIsLoading(true);
    try {
      const response = await authAPI.register(payload);
      if (response.status !== 201) {
        throw new Error(response.data.error || 'Registration failed');
      }
      toast.success('Registered successfully');
      navigate('/auth/login');
    } catch (error) {
      console.error(error);
      let errorMessage = (error as Error).message;
      if (error instanceof AxiosError) {
        errorMessage = error.response?.data?.error ?? errorMessage;
      }
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_STORE_KEY);
    setUser(null);
    toast.info("Logged out successfully");
    navigate('/auth/login');
  }, []);

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{
      user,
      login,
      register,
      logout,
      isLoading
    }}>
      {children}
    </AuthContext.Provider>
  );
}