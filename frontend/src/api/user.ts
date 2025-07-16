import api from "./axios";

export const usersAPI = {
  getUsers: () => api.get('/users'),
} 