import api from './client';

export const adminApi = {
    getStats: async () => {
        const { data } = await api.get('/admin/stats');
        return data.stats;
    },

    getListings: async (page = 1, status?: string) => {
        const params = new URLSearchParams({ page: String(page) });
        if (status) params.set('status', status);
        const { data } = await api.get(`/admin/listings?${params}`);
        return data;
    },

    approveListing: async (id: string) => {
        const { data } = await api.put(`/admin/listings/${id}/approve`);
        return data;
    },

    rejectListing: async (id: string) => {
        const { data } = await api.put(`/admin/listings/${id}/reject`);
        return data;
    },

    getReports: async (page = 1, status?: string) => {
        const params = new URLSearchParams({ page: String(page) });
        if (status) params.set('status', status);
        const { data } = await api.get(`/admin/reports?${params}`);
        return data;
    },

    resolveReport: async (id: string) => {
        const { data } = await api.put(`/admin/reports/${id}/resolve`);
        return data;
    },
};
