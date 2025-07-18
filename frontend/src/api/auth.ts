import type { LoginValues } from "../components/LoginForm";
import type { RegisterValues } from "../components/RegisterForm";
import type { ErrorResponse } from "../type";
import api from "./axios";

export const authAPI = {
  login: (payload: LoginValues) => api.post('/auth/login', payload),
  register: (payload: Omit<RegisterValues, 'confirmPassword'>) => api.post<{ _id: string } & ErrorResponse>('/users', payload),
} 