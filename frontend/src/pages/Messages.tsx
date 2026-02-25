/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState } from 'react';
import { useConversations, useMarkAsRead } from '@/hooks/useChat';
import { useAuthStore } from '@/store/authStore';
import { ChatWindow } from '@/components/chat/ChatWindow';
import { User, MessageSquare, Search, ChevronRight } from 'lucide-react';
import { PageLoader } from '@/components/common/LoadingSpinner';
import { formatDistanceToNow } from 'date-fns';
import { useEffect } from 'react';

export default function Messages() {
    const { user } = useAuthStore();
    const { data: conversations, isLoading } = useConversations();
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const markAsRead = useMarkAsRead();

    const selectedConv = conversations?.find(c => c.id === selectedId);

    useEffect(() => {
        if (selectedId && selectedConv?.unread_count && selectedConv.unread_count > 0) {
            markAsRead.mutate(selectedId);
        }
    }, [selectedId, selectedConv?.unread_count, markAsRead]);

    if (isLoading) return <PageLoader />;

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 h-[calc(100vh-160px)]">
            <div className="flex bg-slate-900 rounded-2xl border border-slate-800 h-full overflow-hidden shadow-2xl">
                {/* User List */}
                <div className={`w-full md:w-80 border-r border-slate-800 flex flex-col ${selectedId ? 'hidden md:flex' : 'flex'}`}>
                    <div className="p-4 border-b border-slate-800">
                        <h1 className="text-xl font-bold text-white mb-4">Messages</h1>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                            <input type="text" placeholder="Search chats..." className="input pl-10 py-2 text-xs" />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {!conversations || conversations.length === 0 ? (
                            <div className="p-8 text-center">
                                <MessageSquare className="h-10 w-10 text-slate-700 mx-auto mb-3" />
                                <p className="text-sm text-slate-500">No conversations yet</p>
                            </div>
                        ) : (
                            conversations.map((conv) => {
                                const isBuyer = user?.id === conv.buyer_id;
                                const displayedUser = isBuyer ? conv.seller : conv.buyer;
                                return (
                                    <button
                                        key={conv.id}
                                        onClick={() => setSelectedId(conv.id)}
                                        className={`w-full p-4 flex gap-3 text-left transition-colors border-b border-slate-800/50 hover:bg-slate-800/50 ${selectedId === conv.id ? 'bg-slate-800 border-l-4 border-l-brand-500' : ''
                                            }`}
                                    >
                                        <div className="w-12 h-12 rounded-full bg-slate-800 border border-slate-700 flex-shrink-0 flex items-center justify-center overflow-hidden">
                                            {displayedUser?.avatar_url ? (
                                                <img src={displayedUser.avatar_url} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <User className="h-6 w-6 text-slate-500" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-sm font-bold truncate pr-2 ${conv.unread_count && conv.unread_count > 0 ? 'text-white' : 'text-slate-200'}`}>
                                                {displayedUser?.username || 'User'}
                                            </p>
                                            <div className="flex items-center gap-2">
                                                {conv.unread_count && conv.unread_count > 0 && (
                                                    <span className="w-2 h-2 rounded-full bg-brand-500 shadow-lg shadow-brand-500/50" />
                                                )}
                                                <span className="text-[10px] text-slate-500 whitespace-nowrap">
                                                    {formatDistanceToNow(new Date(conv.updated_at), { addSuffix: false })}
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-400 truncate mb-1">
                                                Re: {conv.listings?.title || 'Listing'}
                                            </p>
                                            <p className="text-xs text-slate-500 truncate italic">
                                                {conv.last_message || 'Start chatting...'}
                                            </p>
                                        </div>
                                    </button>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Chat Window */}
                <div className={`flex-1 flex flex-col bg-slate-950/30 ${!selectedId ? 'hidden md:flex' : 'flex'}`}>
                    {selectedConv ? (
                        <div className="h-full flex flex-col">
                            <div className="md:hidden p-4 border-b border-slate-800">
                                <button onClick={() => setSelectedId(null)} className="text-brand-400 flex items-center gap-1 text-sm font-bold">
                                    <ChevronRight className="h-4 w-4 rotate-180" /> Back to chats
                                </button>
                            </div>
                            <ChatWindow conversation={selectedConv as any} />
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                            <div className="w-16 h-16 rounded-full bg-slate-900 flex items-center justify-center mb-4">
                                <MessageSquare className="h-8 w-8 text-slate-700" />
                            </div>
                            <h2 className="text-xl font-bold text-white mb-2">Your Conversations</h2>
                            <p className="text-slate-500 max-w-xs">
                                Select a chat from the sidebar to start messaging. Your chats are private and secure.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
