'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Button, Input, Badge } from '@/components/ui';
import { formatDate } from '@/lib/utils';

interface Conversation {
    buyerId: string;
    buyer: {
        id: string;
        name: string;
        email: string;
    };
    unreadCount: number;
    lastMessage: {
        subject: string;
        content: string;
        createdAt: string;
    };
    messages: Array<{
        id: string;
        subject: string;
        content: string;
        isRead: boolean;
        createdAt: string;
        sender: { role: string; name: string };
    }>;
}

export default function AdminMessagesPage() {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
    const [replySubject, setReplySubject] = useState('');
    const [replyContent, setReplyContent] = useState('');
    const [sending, setSending] = useState(false);

    useEffect(() => {
        fetchMessages();
    }, []);

    const fetchMessages = async () => {
        try {
            const response = await fetch('/api/messages');
            const data = await response.json();
            if (response.ok) setConversations(data.conversations || []);
        } catch (error) {
            console.error('Failed to fetch messages:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSendReply = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedConversation || !replySubject.trim() || !replyContent.trim()) return;

        setSending(true);
        try {
            const response = await fetch('/api/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    receiverId: selectedConversation.buyerId,
                    subject: replySubject,
                    content: replyContent,
                }),
            });

            if (response.ok) {
                setReplySubject('');
                setReplyContent('');
                fetchMessages();
            }
        } catch (error) {
            console.error('Failed to send reply:', error);
        } finally {
            setSending(false);
        }
    };

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white">Messages</h1>
                <p className="text-slate-400 mt-1">Respond to buyer inquiries</p>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Conversations List */}
                <Card className="lg:col-span-1">
                    <CardHeader>
                        <CardTitle>Conversations</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        {loading ? (
                            <div className="p-4 space-y-4">
                                {[...Array(3)].map((_, i) => (
                                    <div key={i} className="animate-pulse h-16 bg-slate-700 rounded" />
                                ))}
                            </div>
                        ) : conversations.length === 0 ? (
                            <p className="text-slate-400 text-center py-8">No messages yet</p>
                        ) : (
                            <div className="divide-y divide-slate-700">
                                {conversations.map((conv) => (
                                    <button
                                        key={conv.buyerId}
                                        onClick={() => setSelectedConversation(conv)}
                                        className={`w-full p-4 text-left hover:bg-slate-800/50 transition-colors ${selectedConversation?.buyerId === conv.buyerId ? 'bg-slate-800/50' : ''
                                            }`}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <p className="text-white font-medium">{conv.buyer.name}</p>
                                                <p className="text-sm text-slate-400 truncate">{conv.lastMessage.subject}</p>
                                            </div>
                                            {conv.unreadCount > 0 && (
                                                <Badge variant="info">{conv.unreadCount}</Badge>
                                            )}
                                        </div>
                                        <p className="text-xs text-slate-500 mt-1">
                                            {formatDate(conv.lastMessage.createdAt)}
                                        </p>
                                    </button>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Message Thread */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>
                            {selectedConversation ? `Chat with ${selectedConversation.buyer.name}` : 'Select a conversation'}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {selectedConversation ? (
                            <div className="space-y-6">
                                {/* Messages */}
                                <div className="space-y-4 max-h-[400px] overflow-y-auto">
                                    {selectedConversation.messages.map((msg) => (
                                        <div
                                            key={msg.id}
                                            className={`p-4 rounded-xl ${msg.sender.role === 'ADMIN'
                                                ? 'bg-cyan-500/10 border border-cyan-500/20 ml-8'
                                                : 'bg-slate-800/50 border border-slate-700 mr-8'
                                                }`}
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="font-medium text-white">
                                                    {msg.sender.role === 'ADMIN' ? 'You' : msg.sender.name}
                                                </span>
                                                <span className="text-xs text-slate-400">
                                                    {formatDate(msg.createdAt)}
                                                </span>
                                            </div>
                                            <p className="text-sm text-cyan-400 mb-1">{msg.subject}</p>
                                            <p className="text-slate-300 whitespace-pre-wrap">{msg.content}</p>
                                        </div>
                                    ))}
                                </div>

                                {/* Reply Form */}
                                <form onSubmit={handleSendReply} className="space-y-4 pt-4 border-t border-slate-700">
                                    <Input
                                        label="Subject"
                                        value={replySubject}
                                        onChange={(e) => setReplySubject(e.target.value)}
                                        placeholder="Re: ..."
                                        required
                                    />
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-1.5">Reply</label>
                                        <textarea
                                            value={replyContent}
                                            onChange={(e) => setReplyContent(e.target.value)}
                                            className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl text-white min-h-[100px]"
                                            placeholder="Type your reply..."
                                            required
                                        />
                                    </div>
                                    <Button type="submit" loading={sending}>
                                        Send Reply
                                    </Button>
                                </form>
                            </div>
                        ) : (
                            <p className="text-slate-400 text-center py-12">
                                Select a conversation from the left to view messages
                            </p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
