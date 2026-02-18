import { apiClient } from "../../lib/apiClient";

export const analyticsApi = {
    getOverview: (params) => {
        const query = new URLSearchParams(params).toString();
        return apiClient.get(`/api/v1/analytics/overview?${query}`);
    },
    getDistribution: (params) => {
        const query = new URLSearchParams(params).toString();
        return apiClient.get(`/api/v1/analytics/distribution?${query}`);
    },
    getPerformance: (params) => {
        const query = new URLSearchParams(params).toString();
        return apiClient.get(`/api/v1/analytics/performance?${query}`);
    },
    getSellers: (params) => {
        const query = new URLSearchParams(params).toString();
        return apiClient.get(`/api/v1/analytics/sellers?${query}`);
    },
    exportReport: (params) => {
        const query = new URLSearchParams(params).toString();
        return apiClient.get(`/api/v1/analytics/export?${query}`, { responseType: 'blob' });
    }
};
