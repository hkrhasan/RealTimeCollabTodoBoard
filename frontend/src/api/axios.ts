import axios from "axios";


const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Request interceptor to attach token
api.interceptors.request.use(async (config) => {
  const tokens = localStorage.getItem('tokens');

  if (tokens) {
    config.headers.Authorization = `Bearer ${JSON.parse(tokens).accessToken}`;
  }
  return config;
});


export default api