import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bookmarksApi } from '@/api/bookmarks';
import toast from 'react-hot-toast';

export const useBookmarks = (page = 1) =>
    useQuery({
        queryKey: ['bookmarks', page],
        queryFn: () => bookmarksApi.getAll(page),
    });

export const useAddBookmark = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: bookmarksApi.add,
        onSuccess: () => {
            toast.success('Listing bookmarked!');
            qc.invalidateQueries({ queryKey: ['bookmarks'] });
            qc.invalidateQueries({ queryKey: ['listing'] });
        },
        onError: (err: unknown) => {
            const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Failed to bookmark';
            toast.error(msg);
        },
    });
};

export const useRemoveBookmark = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: bookmarksApi.remove,
        onSuccess: () => {
            toast.success('Bookmark removed');
            qc.invalidateQueries({ queryKey: ['bookmarks'] });
            qc.invalidateQueries({ queryKey: ['listing'] });
        },
    });
};
