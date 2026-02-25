import api from './client';
import { ListingFilters, ListingsResponse, Listing } from '@/types';

export const listingsApi = {
    getAll: async (filters: ListingFilters = {}): Promise<ListingsResponse> => {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, val]) => {
            if (val !== undefined && val !== null && val !== '') {
                params.set(key, String(val));
            }
        });
        const { data } = await api.get(`listings?${params}`);
        return data;
    },

    getById: async (id: string): Promise<{ listing: Listing }> => {
        const { data } = await api.get(`listings/${id}`);
        return data;
    },

    getMy: async (page = 1): Promise<ListingsResponse> => {
        const { data } = await api.get(`listings/my?page=${page}`);
        return data;
    },

    create: async (payload: Partial<Listing>): Promise<{ listing: Listing }> => {
        const { data } = await api.post('listings', payload);
        return data;
    },

    update: async (id: string, payload: Partial<Listing>): Promise<{ listing: Listing }> => {
        const { data } = await api.put(`listings/${id}`, payload);
        return data;
    },

    delete: async (id: string): Promise<{ message: string }> => {
        const { data } = await api.delete(`listings/${id}`);
        return data;
    },

    uploadImages: async (id: string, files: File[]): Promise<{ images: unknown[] }> => {
        const form = new FormData();
        files.forEach((f) => form.append('images', f));
        const { data } = await api.post(`listings/${id}/images`, form, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return data;
    },

    deleteImage: async (listingId: string, imageId: string): Promise<void> => {
        await api.delete(`listings/${listingId}/images/${imageId}`);
    },
};
