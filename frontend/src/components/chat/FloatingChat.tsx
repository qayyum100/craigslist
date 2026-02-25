import { useState, useMemo, useEffect } from 'react';
import { MessageSquare, X, ChevronUp, User } from 'lucide-react';
import { useConversations, useMarkAsRead } from '@/hooks/useChat';
import { useAuthStore } from '@/store/authStore';
import { ChatWindow } from './ChatWindow';
import { Conversation } from '@/types';

export function FloatingChat() {
    const { user } = useAuthStore();
    const { data: conversations } = useConversations();
    const [isOpen, setIsOpen] = useState(false);
    const [activeChat, setActiveChat] = useState<Conversation | null>(null);

    const totalUnread = useMemo(() => {
        return conversations?.reduce((sum, conv) => sum + (conv.unread_count || 0), 0) || 0;
    }, [conversations]);

    const markAsRead = useMarkAsRead();

    useEffect(() => {
        if (activeChat && activeChat.unread_count && activeChat.unread_count > 0) {
            markAsRead.mutate(activeChat.id);
        }
    }, [activeChat?.id, activeChat?.unread_count, markAsRead]);

    if (!user) return null;

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4">
            {/* Active Chat Window */}
            {activeChat && (
                <div className="w-[350px] sm:w-[400px] shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
                    <ChatWindow
                        conversation={activeChat}
                        onClose={() => setActiveChat(null)}
                    />
                </div>
            )}

            {/* Conversation List / Toggle */}
            <div className="flex flex-col items-end">
                {isOpen && !activeChat && (
                    <div className="mb-4 w-80 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden glass animate-in fade-in zoom-in duration-200">
                        <div className="p-4 border-b border-slate-800 bg-slate-800/50 flex items-center justify-between">
                            <h3 className="font-bold text-white">Messages</h3>
                            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white">
                                <ChevronUp className="h-4 w-4 rotate-180" />
                            </button>
                        </div>
                        <div className="max-h-96 overflow-y-auto">
                            {!conversations || conversations.length === 0 ? (
                                <div className="p-8 text-center text-slate-500 text-sm">
                                    No conversations yet
                                </div>
                            ) : (
                                conversations.map((conv) => {
                                    const isBuyer = user?.id === conv.buyer_id;
                                    const otherUser = isBuyer ? conv.seller : conv.buyer;
                                    return (
                                        <button
                                            key={conv.id}
                                            onClick={() => {
                                                setActiveChat(conv);
                                                setIsOpen(false);
                                            }}
                                            className="w-full p-4 flex gap-3 hover:bg-slate-800/50 transition-colors border-b border-slate-800/30 text-left"
                                        >
                                            <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex-shrink-0 flex items-center justify-center overflow-hidden">
                                                {otherUser?.avatar_url ? (
                                                    <img src={otherUser.avatar_url} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <User className="h-5 w-5 text-slate-500" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start">
                                                    <p className="text-sm font-bold text-slate-200 truncate">{otherUser?.username || 'User'}</p>
                                                    {conv.unread_count && conv.unread_count > 0 && (
                                                        <span className="w-2 h-2 rounded-full bg-brand-500" />
                                                    )}
                                                </div>
                                                <p className="text-xs text-slate-500 truncate">{conv.last_message || 'Start chatting...'}</p>
                                            </div>
                                        </button>
                                    );
                                })
                            )}
                        </div>
                    </div>
                )}

                {/* Floating Bubble */}
                <button
                    onClick={() => {
                        if (activeChat) setActiveChat(null);
                        else setIsOpen(!isOpen);
                    }}
                    className="group relative p-4 bg-brand-500 text-white rounded-full shadow-lg shadow-brand-500/30 hover:bg-brand-600 hover:scale-110 transition-all duration-300"
                >
                    {isOpen || activeChat ? (
                        <X className="h-6 w-6" />
                    ) : (
                        <MessageSquare className="h-6 w-6" />
                    )}

                    {totalUnread > 0 && !isOpen && !activeChat && (
                        <span className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold border-2 border-slate-950 animate-bounce">
                            {totalUnread}
                        </span>
                    )}
                </button>
            </div>
        </div>
    );
}
