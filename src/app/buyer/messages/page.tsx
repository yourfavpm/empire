'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Button, Input } from '@/components/ui';
import { formatDate } from '@/lib/utils';

interface Message {
    id: string;
    subject: string;
    content: string;
    isRead: boolean;
    createdAt: string;
    sender: {
        id: string;
        name: string;
        role: string;
    };
    receiver: {
        id: string;
        name: string;
        role: string;
    };
}

export default function BuyerMessagesPage() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCompose, setShowCompose] = useState(false);
    const [subject, setSubject] = useState('');
    const [content, setContent] = useState('');
    const [sending, setSending] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchMessages();
    }, []);

    const fetchMessages = async () => {
        try {
            const response = await fetch('/api/messages');
            const data = await response.json();
            if (response.ok) setMessages(data.messages);
        } catch (error) {
            console.error('Failed to fetch messages:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!subject.trim() || !content.trim()) {
            setError('Subject and message are required');
            return;
        }

        setSending(true);
        setError('');

        try {
            const response = await fetch('/api/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ subject, content }),
            });

            const data = await response.json();

            if (response.ok) {
                setSuccess('Message sent to admin');
                setShowCompose(false);
                setSubject('');
                setContent('');
                fetchMessages();
            } else {
                setError(data.error || 'Failed to send message');
            }
        } catch (error) {
            setError('Something went wrong');
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white">Messages</h1>
                    <p className="text-slate-400 mt-1">Contact our support team</p>
                </div>
                <Button onClick={() => setShowCompose(!showCompose)}>
                    {showCompose ? 'Cancel' : 'New Message'}
                </Button>
            </div>

            {success && (
                <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
                    {success}
                </div>
            )}

            {/* Compose Form */}
            {showCompose && (
                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle>Send Message to Admin</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSend} className="space-y-4">
                            {error && (
                                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                                    {error}
                                </div>
                            )}

                            <Input
                                label="Subject"
                                type="text"
                                placeholder="What's this about?"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                required
                            />

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                                    Message
                                </label>
                                <textarea
                                    className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent min-h-[150px]"
                                    placeholder="Type your message..."
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    required
                                />
                            </div>

                            <Button type="submit" loading={sending}>
                                Send Message
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            )}

            {/* Messages List */}
            <Card>
                <CardHeader>
                    <CardTitle>Conversation History</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="space-y-4">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="animate-pulse p-4 border border-slate-700 rounded-lg">
                                    <div className="h-4 bg-slate-700 rounded w-1/3 mb-2" />
                                    <div className="h-3 bg-slate-700 rounded w-full" />
                                </div>
                            ))}
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="text-6xl mb-4">💬</div>
                            <h3 className="text-lg font-semibold text-white mb-2">No Messages Yet</h3>
                            <p className="text-slate-400 mb-4">Start a conversation with our support team</p>
                            <Button onClick={() => setShowCompose(true)}>Send First Message</Button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {messages.map((message) => (
                                <div
                                    key={message.id}
                                    className={`p-4 border rounded-xl ${message.sender.role === 'ADMIN'
                                            ? 'bg-violet-500/5 border-violet-500/20 ml-4'
                                            : 'bg-slate-800/50 border-slate-700 mr-4'
                                        }`}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="font-medium text-white">
                                            {message.sender.role === 'ADMIN' ? 'Admin' : 'You'}
                                        </span>
                                        <span className="text-xs text-slate-400">
                                            {formatDate(message.createdAt)}
                                        </span>
                                    </div>
                                    <p className="text-sm text-violet-400 mb-1">{message.subject}</p>
                                    <p className="text-slate-300 whitespace-pre-wrap">{message.content}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
