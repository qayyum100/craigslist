import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { supabase } from '../config/supabase';

const sendMessageSchema = z.object({
    text: z.string().min(1).max(2000),
});

const startConversationSchema = z.object({
    listing_id: z.string().uuid(),
});

export const getConversations = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const userId = req.user!.id;

        const { data: conversations, error } = await supabase
            .from('conversations')
            .select(`
                *,
                listings(id, title),
                buyer:profiles!conversations_buyer_id_fkey(id, username, avatar_url),
                seller:profiles!conversations_seller_id_fkey(id, username, avatar_url)
            `)
            .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
            .order('updated_at', { ascending: false });

        if (error) { next(error); return; }

        // Fetch unread counts for each conversation
        const conversationIds = conversations.map(c => c.id);
        const { data: unreadData, error: unreadError } = await supabase
            .from('messages')
            .select('conversation_id')
            .in('conversation_id', conversationIds)
            .eq('is_read', false)
            .neq('sender_id', userId);

        if (unreadError) { next(unreadError); return; }

        const unreadCountsMap = unreadData.reduce((acc: Record<string, number>, msg: any) => {
            acc[msg.conversation_id] = (acc[msg.conversation_id] || 0) + 1;
            return acc;
        }, {});

        const formattedConversations = conversations.map(conv => ({
            ...conv,
            unread_count: unreadCountsMap[conv.id] || 0
        }));

        res.json({ conversations: formattedConversations });
    } catch (err) {
        next(err);
    }
};

export const getMessages = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { id } = req.params;
        const userId = req.user!.id;

        // Verify user is part of conversation
        const { data: conversation, error: convError } = await supabase
            .from('conversations')
            .select('buyer_id, seller_id')
            .eq('id', id)
            .single();

        if (convError || !conversation) {
            res.status(404).json({ error: 'Conversation not found' });
            return;
        }

        if (conversation.buyer_id !== userId && conversation.seller_id !== userId) {
            res.status(403).json({ error: 'Forbidden' });
            return;
        }

        const { data, error } = await supabase
            .from('messages')
            .select('*')
            .eq('conversation_id', id)
            .order('created_at', { ascending: true });

        if (error) { next(error); return; }

        res.json({ messages: data });
    } catch (err) {
        next(err);
    }
};

export const startConversation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { listing_id } = startConversationSchema.parse(req.body);
        const buyerId = req.user!.id;

        // Get listing to find seller
        const { data: listing, error: listingError } = await supabase
            .from('listings')
            .select('user_id')
            .eq('id', listing_id)
            .single();

        if (listingError || !listing) {
            res.status(404).json({ error: 'Listing not found' });
            return;
        }

        const sellerId = listing.user_id;

        if (buyerId === sellerId) {
            res.status(400).json({ error: 'You cannot message your own listing' });
            return;
        }

        // Check if conversation already exists
        const { data: existing, error: existingError } = await supabase
            .from('conversations')
            .select('*')
            .eq('listing_id', listing_id)
            .eq('buyer_id', buyerId)
            .maybeSingle();

        if (existing) {
            res.json({ conversation: existing });
            return;
        }

        // Create new conversation
        const { data: conversation, error: createError } = await supabase
            .from('conversations')
            .insert({
                listing_id,
                buyer_id: buyerId,
                seller_id: sellerId,
            })
            .select('*')
            .single();

        if (createError) { next(createError); return; }

        res.status(201).json({ conversation });
    } catch (err) {
        next(err);
    }
};

export const sendMessage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { id } = req.params;
        const { text } = sendMessageSchema.parse(req.body);
        const senderId = req.user!.id;

        // Verify conversation access
        const { data: conversation, error: convError } = await supabase
            .from('conversations')
            .select('buyer_id, seller_id')
            .eq('id', id)
            .single();

        if (convError || !conversation) {
            res.status(404).json({ error: 'Conversation not found' });
            return;
        }

        if (conversation.buyer_id !== senderId && conversation.seller_id !== senderId) {
            res.status(403).json({ error: 'Forbidden' });
            return;
        }

        // Insert message
        const { data: message, error: msgError } = await supabase
            .from('messages')
            .insert({
                conversation_id: id,
                sender_id: senderId,
                text,
            })
            .select('*')
            .single();

        if (msgError) { next(msgError); return; }

        // Update conversation summary
        await supabase
            .from('conversations')
            .update({
                last_message: text,
                updated_at: new Date().toISOString(),
            })
            .eq('id', id);

        res.status(201).json({ message });
    } catch (err) {
        next(err);
    }
};

export const markAsRead = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { id } = req.params;
        const userId = req.user!.id;

        const { error } = await supabase
            .from('messages')
            .update({ is_read: true })
            .eq('conversation_id', id)
            .neq('sender_id', userId);

        if (error) { next(error); return; }

        res.json({ success: true });
    } catch (err) {
        next(err);
    }
};
