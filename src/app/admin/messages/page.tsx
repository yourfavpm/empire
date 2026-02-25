import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { isAuthorized } from '@/lib/roles';
import { usePathname } from 'next/navigation';
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
    const { data: session } = useSession();
    const pathname = usePathname();
    const userRole = session?.user?.role;
    const isAuthorizedUser = isAuthorized(userRole, pathname);

    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
    const [replySubject, setReplySubject] = useState('');
    const [replyContent, setReplyContent] = useState('');
    const [sending, setSending] = useState(false);

    const fetchMessages = useCallback(async () => {
        try {
            const response = await fetch('/api/messages');
            const data = await response.json();
            if (response.ok) setConversations(data.conversations || []);
        } catch (error) {
            console.error('Failed to fetch messages:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (isAuthorizedUser) {
            fetchMessages();
        }
    }, [fetchMessages, isAuthorizedUser]);

    if (userRole && !isAuthorizedUser) {
        return (
            <div className="flex items-center justify-center p-20">
                <Card className="max-w-md w-full border-red-100 bg-red-50/10">
                    <CardContent className="p-12 text-center">
                        <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6 text-red-600">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                        </div>
                        <h2 className="text-xl font-black text-red-600 uppercase tracking-tight mb-2">Access Denied</h2>
                        <p className="text-sm font-bold text-slate-500 mb-8">You do not have the required authorization level to access Messages & Support.</p>
                        <Button className="w-full bg-red-600 font-black uppercase tracking-widest text-[10px]" onClick={() => window.location.href = '/admin'}>Return to Dashboard</Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

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
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-brand tracking-tight">Messages & Support</h1>
                <p className="text-[10px] text-slate-500 mt-1 uppercase font-black tracking-widest">Respond to buyer inquiries and support tickets</p>
            </div>

            <div className="grid lg:grid-cols-3 gap-6 items-start">
                {/* Conversations List */}
                <Card className="lg:col-span-1 border-slate-200 bg-white shadow-sm overflow-hidden">
                    <CardHeader className="border-b border-slate-50 bg-slate-50/50">
                        <CardTitle className="text-[10px] font-black uppercase tracking-widest text-slate-400">Recent Conversations</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        {loading ? (
                            <div className="p-4 space-y-4">
                                {[...Array(3)].map((_, i) => (
                                    <div key={i} className="animate-pulse h-20 bg-slate-50 rounded-xl" />
                                ))}
                            </div>
                        ) : conversations.length === 0 ? (
                            <p className="text-slate-400 text-center py-12 text-xs italic">No active conversations found</p>
                        ) : (
                            <div className="divide-y divide-slate-50">
                                {conversations.map((conv) => (
                                    <button
                                        key={conv.buyerId}
                                        onClick={() => setSelectedConversation(conv)}
                                        className={`w-full p-5 text-left transition-all relative ${selectedConversation?.buyerId === conv.buyerId
                                            ? 'bg-slate-50/80 border-l-4 border-l-brand'
                                            : 'hover:bg-slate-50 border-l-4 border-l-transparent'
                                            }`}
                                    >
                                        <div className="flex items-start justify-between mb-1">
                                            <p className={`text-sm font-black tracking-tight ${selectedConversation?.buyerId === conv.buyerId ? 'text-brand' : 'text-slate-700'}`}>{conv.buyer.name}</p>
                                            {conv.unreadCount > 0 && (
                                                <Badge className="bg-brand text-white text-[9px] px-1.5 py-0.5 rounded-full">{conv.unreadCount}</Badge>
                                            )}
                                        </div>
                                        <p className="text-[11px] text-slate-500 font-bold truncate pr-4">{conv.lastMessage.subject || 'No Subject'}</p>
                                        <p className="text-[9px] text-slate-400 font-black uppercase tracking-tighter mt-2">
                                            {formatDate(conv.lastMessage.createdAt)}
                                        </p>
                                    </button>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Message Thread */}
                <Card className="lg:col-span-2 border-slate-200 bg-white shadow-sm overflow-hidden min-h-[600px] flex flex-col">
                    <CardHeader className="border-b border-slate-50 bg-slate-50/50">
                        <CardTitle className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                            {selectedConversation ? `CHAT WITH ${selectedConversation.buyer.name.toUpperCase()}` : 'SELECT A CONVERSATION'}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col p-6">
                        {selectedConversation ? (
                            <div className="flex flex-col h-full space-y-8">
                                {/* Messages */}
                                <div className="space-y-6 flex-1 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                                    {selectedConversation.messages.map((msg) => (
                                        <div
                                            key={msg.id}
                                            className={`p-5 rounded-2xl border ${msg.sender.role !== 'BUYER'
                                                ? 'bg-brand/5 border-brand/10 ml-12'
                                                : 'bg-slate-50 border-slate-100 mr-12'
                                                }`}
                                        >
                                            <div className="flex items-center justify-between mb-3">
                                                <span className={`text-[10px] font-black uppercase tracking-widest ${msg.sender.role !== 'BUYER' ? 'text-brand' : 'text-slate-600'}`}>
                                                    {msg.sender.role !== 'BUYER' ? 'Site Administrator' : msg.sender.name}
                                                </span>
                                                <span className="text-[9px] text-slate-400 font-bold uppercase">
                                                    {formatDate(msg.createdAt)}
                                                </span>
                                            </div>
                                            {msg.subject && <p className="text-xs font-black text-brand/80 mb-2 uppercase tracking-tight">Re: {msg.subject}</p>}
                                            <p className="text-sm text-slate-600 leading-relaxed font-medium whitespace-pre-wrap">{msg.content}</p>
                                        </div>
                                    ))}
                                </div>

                                {/* Reply Form */}
                                <form onSubmit={handleSendReply} className="space-y-4 pt-6 border-t border-slate-100 mt-auto">
                                    <div className="space-y-4">
                                        <Input
                                            placeholder="Subject (optional)"
                                            value={replySubject}
                                            onChange={(e) => setReplySubject(e.target.value)}
                                            className="h-10 text-xs bg-white border-slate-300 font-bold"
                                        />
                                        <div className="space-y-2">
                                            <textarea
                                                value={replyContent}
                                                onChange={(e) => setReplyContent(e.target.value)}
                                                className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-brand text-sm font-medium min-h-[120px] outline-none focus:ring-2 focus:ring-brand/20 transition-all placeholder:text-slate-300"
                                                placeholder="Type your official response..."
                                                required
                                            />
                                        </div>
                                    </div>
                                    <Button type="submit" loading={sending} className="w-full h-11 bg-brand hover:bg-brand-light font-black uppercase tracking-widest text-[11px] shadow-lg shadow-brand/20">
                                        Send Official Reply
                                    </Button>
                                </form>
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-center py-20">
                                <span className="text-4xl mb-4">💬</span>
                                <p className="text-slate-400 text-xs font-black uppercase tracking-widest">
                                    Select a person from the list<br />to start messaging
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
