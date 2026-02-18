import { apiClient } from "../../lib/apiClient";

export const usersApi = {
    list: (params) => {
        const query = new URLSearchParams(params).toString();
        return apiClient.get(`/api/v1/users?${query}`);
    },
    get: (id) => apiClient.get(`/api/v1/users/${id}`),
    create: (data) => apiClient.post("/api/v1/users", data),
    update: (id, data) => apiClient.put(`/api/v1/users/${id}`, data),
    delete: (id) => apiClient.delete(`/api/v1/users/${id}`),
    uploadPicture: (id, formData) => apiClient.post(`/api/v1/users/${id}/picture`, formData),
    toggleStatus: (id) => apiClient.put(`/api/v1/users/${id}/toggle_status`),
    resendConfirmation: (id) => apiClient.post(`/api/v1/users/${id}/resend_confirmation`),
    getSummary: (id) => apiClient.get(`/api/v1/users/${id}/summary`),
    getPayments: (id) => apiClient.get(`/api/v1/users/${id}/payments`),
    changePassword: (id, data) => apiClient.patch(`/api/v1/users/${id}/change_password`, data),
};
