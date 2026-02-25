import { useState, useEffect, useRef } from 'react';
import { Send, User as UserIcon, X, Loader2 } from 'lucide-react';
import { useMessages, useSendMessage } from '@/hooks/useChat';
import { useAuthStore } from '@/store/authStore';
import { formatDistanceToNow } from 'date-fns';

interface ChatWindowProps {
    conversation: {
        id: string;
        seller_id: string;
        buyer_id: string;
        seller?: { username: string; avatar_url?: string | null };
        buyer?: { username: string; avatar_url?: string | null };
    };
    onClose?: () => void;
}

export function ChatWindow({ conversation, onClose }: ChatWindowProps) {
    const { user } = useAuthStore();
    const [text, setText] = useState('');
    const { data: messages, isLoading } = useMessages(conversation.id);
    const sendMessage = useSendMessage();
    const scrollRef = useRef<HTMLDivElement>(null);

    const otherUser = user?.id === conversation.seller_id ? conversation.buyer : conversation.seller;

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!text.trim() || sendMessage.isPending) return;

        try {
            await sendMessage.mutateAsync({ conversationId: conversation.id, text: text.trim() });
            setText('');
        } catch {
            // Error handled by hook
        }
    };

    return (
        <div className="flex flex-col h-[500px] w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden glass">
            {/* Header */}
            <div className="p-4 border-b border-slate-800 bg-slate-800/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-brand-500/20 border border-brand-500/30 flex items-center justify-center">
                        <UserIcon className="h-4 w-4 text-brand-400" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-white">{otherUser?.username || 'User'}</p>
                        <p className="text-[10px] text-brand-400 font-bold uppercase tracking-wider">Online</p>
                    </div>
                </div>
                {onClose && (
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-white transition-colors">
                        <X className="h-4 w-4" />
                    </button>
                )}
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 p-4 overflow-y-auto space-y-4 scroll-smooth">
                {isLoading ? (
                    <div className="flex justify-center py-10">
                        <Loader2 className="h-6 w-6 animate-spin text-brand-500" />
                    </div>
                ) : messages?.length === 0 ? (
                    <div className="text-center py-10">
                        <p className="text-sm text-slate-500 italic">No messages yet. Say hi!</p>
                    </div>
                ) : (
                    messages?.map((msg) => {
                        const isMe = msg.sender_id === user?.id;
                        return (
                            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm ${isMe
                                        ? 'bg-brand-500 text-white rounded-br-none shadow-lg shadow-brand-500/20'
                                        : 'bg-slate-800 text-slate-200 rounded-bl-none border border-slate-700'
                                    }`}>
                                    <p>{msg.text}</p>
                                    <p className={`text-[9px] mt-1 ${isMe ? 'text-white/60' : 'text-slate-500'}`}>
                                        {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                                    </p>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="p-4 border-t border-slate-800 bg-slate-900/50">
                <div className="relative">
                    <input
                        type="text"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Type a message..."
                        className="input pr-12 py-3 bg-slate-800 border-slate-700"
                    />
                    <button
                        type="submit"
                        disabled={!text.trim() || sendMessage.isPending}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-brand-400 hover:text-brand-300 disabled:opacity-50 transition-colors"
                    >
                        {sendMessage.isPending ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                            <Send className="h-5 w-5" />
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
