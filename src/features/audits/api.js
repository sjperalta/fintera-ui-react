import { apiClient } from "../../lib/apiClient";

export const auditsApi = {
    list: (params) => {
        const query = new URLSearchParams(params).toString();
        return apiClient.get(`/api/v1/audits?${query}`);
    },
};
