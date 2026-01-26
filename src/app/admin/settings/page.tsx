
'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Button, Input } from '@/components/ui';
import { formatCurrency } from '@/lib/utils';

export default function AdminSettingsPage() {
    const [settings, setSettings] = useState<any>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Form states
    const [referralBonus, setReferralBonus] = useState('');
    const [btcAddress, setBtcAddress] = useState('');
    const [ethAddress, setEthAddress] = useState('');
    const [usdtTrc20Address, setUsdtTrc20Address] = useState('');

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await fetch('/api/admin/settings');
            if (res.ok) {
                const data = await res.json();
                setSettings(data);
                setReferralBonus(data.referral_bonus_amount || '0');
                setBtcAddress(data.crypto_btc_address || '');
                setEthAddress(data.crypto_eth_address || '');
                setUsdtTrc20Address(data.crypto_usdt_trc20_address || '');
            }
        } catch (error) {
            console.error('Failed to fetch settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveSetting = async (key: string, value: string, description: string) => {
        setSaving(true);
        try {
            const res = await fetch('/api/admin/settings', {
                method: 'POST',
                body: JSON.stringify({ key, value, description }),
            });

            if (res.ok) {
                alert('Setting saved successfully');
                fetchSettings();
            } else {
                alert('Failed to save setting');
            }
        } catch (error) {
            console.error(error);
        } finally {
            setSaving(false);
        }
    };

    const handleSaveReferral = (e: React.FormEvent) => {
        e.preventDefault();
        handleSaveSetting('referral_bonus_amount', referralBonus, 'Amount credited to referrer');
    };

    const handleSaveCrypto = (e: React.FormEvent) => {
        e.preventDefault();
        // Since we have multiple, let's just save them one by one or create a bulk endpoint.
        // For now, let's just provide a single save for all 3 for simplicity.
        Promise.all([
            handleSaveSetting('crypto_btc_address', btcAddress, 'Bitcoin wallet address'),
            handleSaveSetting('crypto_eth_address', ethAddress, 'Ethereum/ERC20 wallet address'),
            handleSaveSetting('crypto_usdt_trc20_address', usdtTrc20Address, 'USDT TRC20 wallet address')
        ]);
    };

    if (loading) return <div className="text-brand flex items-center justify-center p-20 font-black uppercase tracking-widest text-xs animate-pulse">Initializing System Config...</div>;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-brand tracking-tight">System Settings</h1>
                <p className="text-[10px] text-slate-500 mt-1 uppercase font-black tracking-widest">Global platform configuration & management</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 items-start">
                {/* Referral Settings */}
                <Card className="border-slate-200 bg-white shadow-sm overflow-hidden">
                    <CardHeader className="border-b border-slate-50 bg-slate-50/50">
                        <CardTitle className="text-[10px] font-black uppercase tracking-widest text-slate-400">Referral Program</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <form onSubmit={handleSaveReferral} className="space-y-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="text-[10px] uppercase font-black text-slate-400 mb-2 block tracking-widest">Referral Bonus Amount (₦)</label>
                                    <div className="flex gap-2">
                                        <Input
                                            type="number"
                                            value={referralBonus}
                                            onChange={e => setReferralBonus(e.target.value)}
                                            className="h-10 bg-white border-slate-300 font-black text-brand text-sm"
                                            placeholder="0.00"
                                        />
                                        <Button disabled={saving} type="submit" className="bg-brand hover:bg-brand-light text-white font-black text-[10px] uppercase tracking-widest px-8 h-10 shadow-lg shadow-brand/20 transition-all">
                                            {saving ? 'Updating...' : 'Update'}
                                        </Button>
                                    </div>
                                    <p className="text-[10px] text-slate-500 mt-4 leading-relaxed font-medium">
                                        This capital will be automatically injected into the referrer's wallet upon a successful acquisition (referee's first verified deposit).
                                    </p>
                                </div>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* Crypto Payment Details */}
                <Card className="border-slate-200 bg-white shadow-sm overflow-hidden">
                    <CardHeader className="border-b border-slate-50 bg-slate-50/50">
                        <CardTitle className="text-[10px] font-black uppercase tracking-widest text-slate-400">Crypto Payment Details</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <form onSubmit={handleSaveCrypto} className="space-y-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="text-[10px] uppercase font-black text-slate-400 mb-2 block tracking-widest">BTC Address</label>
                                    <Input
                                        value={btcAddress}
                                        onChange={e => setBtcAddress(e.target.value)}
                                        className="h-10 bg-white border-slate-300 font-black text-brand text-xs"
                                        placeholder="Enter BTC address"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] uppercase font-black text-slate-400 mb-2 block tracking-widest">ETH Address (ERC20)</label>
                                    <Input
                                        value={ethAddress}
                                        onChange={e => setEthAddress(e.target.value)}
                                        className="h-10 bg-white border-slate-300 font-black text-brand text-xs"
                                        placeholder="Enter ETH address"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] uppercase font-black text-slate-400 mb-2 block tracking-widest">USDT Address (TRC20)</label>
                                    <Input
                                        value={usdtTrc20Address}
                                        onChange={e => setUsdtTrc20Address(e.target.value)}
                                        className="h-10 bg-white border-slate-300 font-black text-brand text-xs"
                                        placeholder="Enter USDT TRC20 address"
                                    />
                                </div>
                                <Button disabled={saving} type="submit" className="w-full bg-brand hover:bg-brand-light text-white font-black text-[10px] uppercase tracking-widest h-10 shadow-lg shadow-brand/20 transition-all">
                                    {saving ? 'Saving Addresses...' : 'Save Crypto Details'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
