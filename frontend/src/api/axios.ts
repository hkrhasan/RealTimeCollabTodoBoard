import axios from "axios";
import { AUTH_STORE_KEY } from "../contexts/AuthContext";


const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Request interceptor to attach token
api.interceptors.request.use(async (config) => {
  const tokens = localStorage.getItem(AUTH_STORE_KEY);

  if (tokens) {
    config.headers.Authorization = `Bearer ${JSON.parse(tokens).accessToken}`;
  }
  return config;
});


export default api