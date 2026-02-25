import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from '@/api/client';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';
import { Conversation, Message } from '@/types';

export function useConversations() {
    const queryClient = useQueryClient();
    const { user } = useAuthStore();

    useEffect(() => {
        if (!user || !supabase) return;

        // Subscribe to any changes in conversations involving the current user
        const channel = supabase
            .channel(`user-conversations:${user.id}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'conversations',
                },
                (payload: any) => {
                    // Check if user is part of this conversation
                    const conv = payload.new as any;
                    if (conv.buyer_id === user.id || conv.seller_id === user.id) {
                        console.log('Conversation updated!', payload.new);
                        queryClient.invalidateQueries({ queryKey: ['conversations'] });
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user, queryClient]);

    return useQuery({
        queryKey: ['conversations'],
        queryFn: async () => {
            const { data } = await axios.get<{ conversations: Conversation[] }>('chat');
            return data.conversations;
        },
        enabled: !!user,
    });
}

export function useMessages(conversationId: string | undefined) {
    const queryClient = useQueryClient();

    useEffect(() => {
        if (!conversationId || !supabase) return;

        // Subscribe to real-time messages for THIS conversation
        const channel = supabase
            .channel(`chat:${conversationId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: `conversation_id=eq.${conversationId}`,
                },
                (payload: any) => {
                    console.log('New message received!', payload.new);
                    // Invalidate and refetch
                    queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
                    queryClient.invalidateQueries({ queryKey: ['conversations'] });
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [conversationId, queryClient]);

    return useQuery({
        queryKey: ['messages', conversationId],
        queryFn: async () => {
            if (!conversationId) return [];
            const { data } = await axios.get<{ messages: Message[] }>(`chat/${conversationId}`);
            return data.messages;
        },
        enabled: !!conversationId,
    });
}

export function useStartConversation() {
    return useMutation({
        mutationFn: async (listingId: string) => {
            const { data } = await axios.post<{ conversation: Conversation }>('chat', { listing_id: listingId });
            return data.conversation;
        },
    });
}

export function useSendMessage() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ conversationId, text }: { conversationId: string; text: string }) => {
            const { data } = await axios.post<{ message: Message }>(`chat/${conversationId}/messages`, { text });
            return data.message;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['messages', variables.conversationId] });
            queryClient.invalidateQueries({ queryKey: ['conversations'] });
        },
    });
}

export function useMarkAsRead() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (conversationId: string) => {
            await axios.post(`chat/${conversationId}/read`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['conversations'] });
        },
    });
}
