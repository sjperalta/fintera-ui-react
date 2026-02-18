import { apiClient } from "../../lib/apiClient";

export const dashboardApi = {
    getSellerStats: (month, year) => apiClient.get(`/api/v1/dashboard/seller?month=${month}&year=${year}`),
    getCommissions: (startDate, endDate) => apiClient.get(`/api/v1/reports/commissions?start_date=${startDate}&end_date=${endDate}`),
    downloadCommissionsCsv: (startDate, endDate) => apiClient.get(`/api/v1/reports/commissions_csv?start_date=${startDate}&end_date=${endDate}`, { responseType: 'blob' }),
};
