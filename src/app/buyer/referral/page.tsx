
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardHeader, CardTitle, CardContent, Button, Input } from '@/components/ui';
import { formatCurrency } from '@/lib/utils';
import { Copy, Users, CheckCircle } from 'lucide-react';

export default function ReferralPage() {
    const { data: session } = useSession();
    const [stats, setStats] = useState({ total_referrals: 0, total_earned: 0 });
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const res = await fetch('/api/referral/stats');
            if (res.ok) {
                const data = await res.json();
                setStats(data);
            }
        } catch (error) {
            console.error('Failed to fetch referral stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const referralLink = session?.user?.id
        ? `${window.location.origin}/signup?ref=${session.user.id}`
        : 'Loading...';

    const copyToClipboard = () => {
        navigator.clipboard.writeText(referralLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-white tracking-tight">Referral Program</h1>
                <p className="text-slate-400 mt-1">Invite friends and earn rewards.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                {/* Stats Cards */}
                <Card className="bg-gradient-to-br from-cyan-900/20 to-slate-900 border-slate-800">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                                <Users className="w-6 h-6 text-cyan-400" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-400">Total Referrals</p>
                                <h3 className="text-3xl font-black text-white">{stats.total_referrals}</h3>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-emerald-900/20 to-slate-900 border-slate-800">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                                <span className="text-2xl">💰</span>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-400">Total Earned</p>
                                <h3 className="text-3xl font-black text-emerald-400">
                                    {formatCurrency(Number(stats.total_earned))}
                                </h3>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Link Section */}
            <Card className="border-slate-800 bg-slate-900/50">
                <CardHeader>
                    <CardTitle className="text-lg font-bold text-white">Your Unique Link</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-slate-400 mb-4">
                        Share this link with your friends. You will earn a bonus for every user who signs up and makes their first deposit.
                    </p>

                    <div className="flex gap-2">
                        <Input
                            value={referralLink}
                            readOnly
                            className="bg-slate-950 border-slate-800 font-mono text-sm text-cyan-400"
                        />
                        <Button
                            onClick={copyToClipboard}
                            className={`min-w-[100px] font-bold ${copied ? 'bg-green-600 hover:bg-green-600' : 'bg-cyan-600 hover:bg-cyan-500'} text-white transition-all`}
                        >
                            {copied ? (
                                <>
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Copied
                                </>
                            ) : (
                                <>
                                    <Copy className="w-4 h-4 mr-2" />
                                    Copy
                                </>
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
