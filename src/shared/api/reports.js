import { apiClient } from "../../lib/apiClient";

export const reportsApi = {
    downloadUserBalancePDF: (userId) => apiClient.get(`/api/v1/reports/user_balance_pdf?user_id=${userId}`, { responseType: 'blob' }),
    downloadReport: (reportId, params) => {
        const query = new URLSearchParams(params).toString();
        return apiClient.get(`/api/v1/reports/${reportId}?${query}`, { responseType: 'blob' });
    }
};
