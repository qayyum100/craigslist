import api from './client';

export const bookmarksApi = {
    getAll: async (page = 1) => {
        const { data } = await api.get(`bookmarks?page=${page}`);
        return data;
    },

    add: async (listingId: string) => {
        const { data } = await api.post(`bookmarks/${listingId}`);
        return data;
    },

    remove: async (listingId: string) => {
        const { data } = await api.delete(`bookmarks/${listingId}`);
        return data;
    },
};

export const reportsApi = {
    create: async (listingId: string, reason: string) => {
        const { data } = await api.post(`reports/${listingId}`, { reason });
        return data;
    },
};

export const categoriesApi = {
    getAll: async () => {
        const { data } = await api.get('categories');
        return data.categories;
    },
};
