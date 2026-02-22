import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listingsApi } from '@/api/listings';
import { categoriesApi } from '@/api/bookmarks';
import { ListingFilters } from '@/types';

export const useListings = (filters: ListingFilters) =>
    useQuery({
        queryKey: ['listings', filters],
        queryFn: () => listingsApi.getAll(filters),
        staleTime: 30_000,
    });

export const useListing = (id: string) =>
    useQuery({
        queryKey: ['listing', id],
        queryFn: () => listingsApi.getById(id),
        enabled: !!id,
    });

export const useMyListings = (page = 1) =>
    useQuery({
        queryKey: ['listings', 'my', page],
        queryFn: () => listingsApi.getMy(page),
    });

export const useCategories = () =>
    useQuery({
        queryKey: ['categories'],
        queryFn: categoriesApi.getAll,
        staleTime: 5 * 60_000,
    });

export const useCreateListing = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: listingsApi.create,
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['listings'] }); },
    });
};

export const useUpdateListing = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: Parameters<typeof listingsApi.update>[1] }) =>
            listingsApi.update(id, payload),
        onSuccess: (_data, variables) => {
            qc.invalidateQueries({ queryKey: ['listing', variables.id] });
            qc.invalidateQueries({ queryKey: ['listings'] });
        },
    });
};

export const useDeleteListing = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: listingsApi.delete,
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['listings'] }); },
    });
};

export const useUploadImages = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, files }: { id: string; files: File[] }) =>
            listingsApi.uploadImages(id, files),
        onSuccess: (_data, variables) => {
            qc.invalidateQueries({ queryKey: ['listing', variables.id] });
        },
    });
};
