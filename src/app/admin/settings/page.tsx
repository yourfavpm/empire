
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

    // Banner states
    const [banners, setBanners] = useState<any[]>([]);
    const [newBanner, setNewBanner] = useState({ content: '', link: '', active: true });
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        fetchSettings();
        fetchBanners();
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

    const fetchBanners = async () => {
        try {
            const res = await fetch('/api/admin/banners');
            if (res.ok) {
                const data = await res.json();
                setBanners(data);
            }
        } catch (error) {
            console.error('Failed to fetch banners:', error);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            if (res.ok) {
                const data = await res.json();
                setNewBanner(prev => ({ ...prev, content: data.url }));
                alert('Image uploaded successfully');
            } else {
                const error = await res.json();
                alert(`Upload failed: ${error.error}`);
            }
        } catch (error) {
            console.error('Upload error:', error);
            alert('Upload failed. Please try again.');
        } finally {
            setUploading(false);
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

    const handleAddBanner = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newBanner.content) return alert('Please provide an image or upload one');

        setSaving(true);
        try {
            const res = await fetch('/api/admin/banners', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newBanner),
            });

            if (res.ok) {
                setNewBanner({ content: '', link: '', active: true });
                fetchBanners();
                alert('Banner added successfully');
            }
        } catch (error) {
            console.error(error);
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteBanner = async (id: string) => {
        if (!confirm('Are you sure you want to delete this banner?')) return;

        try {
            const res = await fetch(`/api/admin/banners?id=${id}`, { method: 'DELETE' });
            if (res.ok) {
                fetchBanners();
                alert('Banner deleted');
            }
        } catch (error) {
            console.error(error);
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

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
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

                {/* Banner Management */}
                <div className="space-y-6">
                    <Card className="border-slate-200 bg-white shadow-sm overflow-hidden">
                        <CardHeader className="border-b border-slate-50 bg-slate-50/50">
                            <CardTitle className="text-[10px] font-black uppercase tracking-widest text-slate-400">Add Homepage Banner</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <form onSubmit={handleAddBanner} className="space-y-4">
                                <div>
                                    <label className="text-[10px] uppercase font-black text-slate-400 mb-1.5 block tracking-widest">Image Source</label>
                                    <div className="space-y-3">
                                        <Input
                                            value={newBanner.content}
                                            onChange={e => setNewBanner({ ...newBanner, content: e.target.value })}
                                            className="h-10 bg-white border-slate-300 font-black text-brand text-xs"
                                            placeholder="https://example.com/image.jpg"
                                        />
                                        <div className="flex items-center gap-3">
                                            <div className="flex-1 h-px bg-slate-100" />
                                            <span className="text-[8px] font-black text-slate-300 uppercase tracking-tighter">Or Upload</span>
                                            <div className="flex-1 h-px bg-slate-100" />
                                        </div>
                                        <div className="relative group">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageUpload}
                                                disabled={uploading}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                            />
                                            <div className="h-12 border-2 border-dashed border-slate-100 group-hover:border-brand/20 rounded-xl flex items-center justify-center transition-all bg-slate-50/30">
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                    {uploading ? 'Processing Architecture...' : 'Select Terminal Image'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] uppercase font-black text-slate-400 mb-1.5 block tracking-widest">Link (Optional)</label>
                                    <Input
                                        value={newBanner.link}
                                        onChange={e => setNewBanner({ ...newBanner, link: e.target.value })}
                                        className="h-10 bg-white border-slate-300 font-black text-brand text-xs"
                                        placeholder="/assets"
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={newBanner.active}
                                        onChange={e => setNewBanner({ ...newBanner, active: e.target.checked })}
                                        className="w-4 h-4 rounded border-slate-300"
                                    />
                                    <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Active</label>
                                </div>
                                <Button disabled={saving} type="submit" className="w-full bg-brand hover:bg-brand-light text-white font-black text-[10px] uppercase tracking-widest h-10 shadow-lg shadow-brand/20 transition-all">
                                    {saving ? 'Adding Banner...' : 'Add Banner'}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    <Card className="border-slate-200 bg-white shadow-sm overflow-hidden">
                        <CardHeader className="border-b border-slate-50 bg-slate-50/50">
                            <CardTitle className="text-[10px] font-black uppercase tracking-widest text-slate-400">Active Banners</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4">
                            <div className="space-y-4">
                                {banners.length === 0 ? (
                                    <p className="text-[10px] text-slate-400 text-center py-4 uppercase font-black tracking-widest">No banners configured</p>
                                ) : (
                                    banners.map((banner) => (
                                        <div key={banner.id} className="flex gap-4 p-3 bg-slate-50 rounded-xl border border-slate-100 group relative">
                                            <div className="w-16 h-16 bg-slate-200 rounded-lg overflow-hidden flex-shrink-0">
                                                <img src={banner.content} className="w-full h-full object-cover" alt="Banner" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[9px] font-black text-brand uppercase truncate tracking-tight">{banner.link || 'No Link'}</p>
                                                <p className={`text-[8px] font-black uppercase mt-1 ${banner.active ? 'text-emerald-500' : 'text-slate-400'}`}>
                                                    {banner.active ? 'Visible' : 'Inactive'}
                                                </p>
                                                <button
                                                    onClick={() => handleDeleteBanner(banner.id)}
                                                    className="mt-2 text-[8px] font-black uppercase text-red-500 hover:underline"
                                                >
                                                    Remove Banner
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
