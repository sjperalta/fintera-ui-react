import { apiClient } from "../../lib/apiClient";

export const projectsApi = {
    list: (params) => {
        const query = new URLSearchParams(params).toString();
        return apiClient.get(`/api/v1/projects?${query}`);
    },
    get: (id) => apiClient.get(`/api/v1/projects/${id}`),
    create: (data) => apiClient.post("/api/v1/projects", data),
    update: (id, data) => apiClient.put(`/api/v1/projects/${id}`, data),
    delete: (id) => apiClient.delete(`/api/v1/projects/${id}`),
    import: (formData) => apiClient.post("/api/v1/projects/import", formData), // apiClient handles FormData? Usually fetch handles it better if content-type is not set.
    // apiClient in src/lib/apiClient.js sets Content-Type: application/json by default.
    // I might need to handle FormData specially in apiClient or just pass specific headers.
    // Let's check apiClient implementation again.

    createLot: (projectId, data) => apiClient.post(`/api/v1/projects/${projectId}/lots`, data),
    getLot: (projectId, lotId) => apiClient.get(`/api/v1/projects/${projectId}/lots/${lotId}`),
    updateLot: (projectId, lotId, data) => apiClient.put(`/api/v1/projects/${projectId}/lots/${lotId}`, data),
    createContract: (projectId, lotId, data) => apiClient.post(`/api/v1/projects/${projectId}/lots/${lotId}/contracts`, data),
};
