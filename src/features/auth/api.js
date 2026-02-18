import { apiClient } from "../../lib/apiClient";

export const authApi = {
    login: (credentials) => apiClient.post("/api/v1/auth/login", credentials),
    refresh: (refreshToken) => apiClient.post("/api/v1/auth/refresh", { refresh_token: refreshToken }),
    logout: () => apiClient.post("/api/v1/auth/logout"),
};
