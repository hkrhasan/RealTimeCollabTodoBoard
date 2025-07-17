import api from "./axios";

export const activityAPI = {
  getActivities: () => api.get('/activities'),
} 