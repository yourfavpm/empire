'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Button, Input, Badge, StatusBadge } from '@/components/ui';
import { formatCurrency } from '@/lib/utils';

interface Asset {
    id: string;
    title: string;
    category: string;
    platformType: string;
    price: number;
    shortDescription: string;
    status: string;
    featured: boolean;
    featuredOrder: number;
    createdAt: string;
    unlockCount: number;
}

export default function AdminAssetsPage() {
    const [assets, setAssets] = useState<Asset[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    // Form fields
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('');
    const [platformType, setPlatformType] = useState('');
    const [price, setPrice] = useState('');
    const [shortDescription, setShortDescription] = useState('');
    const [fullDescription, setFullDescription] = useState('');
    const [status, setStatus] = useState('DRAFT');

    useEffect(() => {
        fetchAssets();
    }, []);

    const fetchAssets = async () => {
        try {
            const response = await fetch('/api/assets?limit=100');
            const data = await response.json();
            if (response.ok) setAssets(data.assets);
        } catch (error) {
            console.error('Failed to fetch assets:', error);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setTitle('');
        setCategory('');
        setPlatformType('');
        setPrice('');
        setShortDescription('');
        setFullDescription('');
        setStatus('DRAFT');
        setEditingId(null);
        setError('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError('');

        try {
            const payload = {
                title,
                category,
                platformType,
                price: parseFloat(price),
                shortDescription,
                fullDescription,
                status,
                images: [],
                documents: [],
            };

            const url = editingId ? `/api/assets/${editingId}` : '/api/assets';
            const method = editingId ? 'PATCH' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (response.ok) {
                fetchAssets();
                setShowForm(false);
                resetForm();
            } else {
                setError(data.error || 'Failed to save asset');
            }
        } catch {
            setError('Something went wrong');
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = async (id: string) => {
        try {
            const response = await fetch(`/api/assets/${id}`);
            const data = await response.json();

            if (response.ok) {
                const asset = data.asset;
                setTitle(asset.title);
                setCategory(asset.category);
                setPlatformType(asset.platformType);
                setPrice(asset.price.toString());
                setShortDescription(asset.shortDescription);
                setFullDescription(asset.fullDescription || '');
                setStatus(asset.status);
                setEditingId(id);
                setShowForm(true);
            }
        } catch (error) {
            console.error('Failed to fetch asset:', error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this asset?')) return;

        try {
            const response = await fetch(`/api/assets/${id}`, { method: 'DELETE' });
            if (response.ok) {
                fetchAssets();
            }
        } catch (error) {
            console.error('Failed to delete asset:', error);
        }
    };

    const handleToggleFeatured = async (id: string, currentFeatured: boolean) => {
        try {
            const response = await fetch(`/api/admin/assets/${id}/feature`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ featured: !currentFeatured }),
            });

            if (response.ok) {
                setAssets(assets.map(a =>
                    a.id === id ? { ...a, featured: !currentFeatured } : a
                ));
            }
        } catch (error) {
            console.error('Failed to toggle featured:', error);
        }
    };

    const categories = ['Web Templates', 'Marketing', 'Business', 'Design', 'Development'];
    const platforms = ['Next.js', 'React', 'Canva/Figma', 'PDF/Document', 'Video', 'Other'];

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-white">Assets</h1>
                    <p className="text-sm text-slate-400 mt-1">Manage digital asset listings</p>
                </div>
                <Button onClick={() => { resetForm(); setShowForm(!showForm); }}>
                    {showForm ? 'Cancel' : 'Add Asset'}
                </Button>
            </div>

            {/* Form */}
            {showForm && (
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="text-base">{editingId ? 'Edit Asset' : 'New Asset'}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {error && (
                                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                                    {error}
                                </div>
                            )}

                            <div className="grid md:grid-cols-2 gap-4">
                                <Input
                                    label="Title"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    required
                                />
                                <Input
                                    label="Price (NGN)"
                                    type="number"
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                    min={0}
                                    required
                                />
                            </div>

                            <div className="grid md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Category</label>
                                    <select
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                        className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl text-white text-sm"
                                        required
                                    >
                                        <option value="">Select category</option>
                                        {categories.map((c) => (
                                            <option key={c} value={c}>{c}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Platform</label>
                                    <select
                                        value={platformType}
                                        onChange={(e) => setPlatformType(e.target.value)}
                                        className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl text-white text-sm"
                                        required
                                    >
                                        <option value="">Select platform</option>
                                        {platforms.map((p) => (
                                            <option key={p} value={p}>{p}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Status</label>
                                    <select
                                        value={status}
                                        onChange={(e) => setStatus(e.target.value)}
                                        className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl text-white text-sm"
                                    >
                                        <option value="DRAFT">Draft</option>
                                        <option value="ACTIVE">Active</option>
                                        <option value="SOLD">Sold</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1.5">Short Description (Public)</label>
                                <textarea
                                    value={shortDescription}
                                    onChange={(e) => setShortDescription(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl text-white min-h-[80px] text-sm"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1.5">Full Description (Locked)</label>
                                <textarea
                                    value={fullDescription}
                                    onChange={(e) => setFullDescription(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl text-white min-h-[120px] text-sm"
                                    required
                                />
                            </div>

                            <Button type="submit" loading={saving}>
                                {editingId ? 'Update Asset' : 'Create Asset'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            )}

            {/* Assets Table */}
            <Card>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-700">
                                    <th className="text-left py-3 px-4 text-slate-400 font-medium text-sm">Title</th>
                                    <th className="text-left py-3 px-4 text-slate-400 font-medium text-sm">Category</th>
                                    <th className="text-left py-3 px-4 text-slate-400 font-medium text-sm">Price</th>
                                    <th className="text-left py-3 px-4 text-slate-400 font-medium text-sm">Status</th>
                                    <th className="text-left py-3 px-4 text-slate-400 font-medium text-sm">Featured</th>
                                    <th className="text-right py-3 px-4 text-slate-400 font-medium text-sm">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    [...Array(5)].map((_, i) => (
                                        <tr key={i} className="border-b border-slate-800">
                                            <td colSpan={6} className="py-3 px-4">
                                                <div className="h-6 bg-slate-700 rounded animate-pulse" />
                                            </td>
                                        </tr>
                                    ))
                                ) : assets.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="text-center py-8 text-slate-400 text-sm">
                                            No assets yet. Create your first one!
                                        </td>
                                    </tr>
                                ) : (
                                    assets.map((asset) => (
                                        <tr key={asset.id} className="border-b border-slate-800 hover:bg-slate-800/30">
                                            <td className="py-3 px-4">
                                                <p className="text-white font-medium text-sm">{asset.title}</p>
                                                <p className="text-xs text-slate-400">{asset.platformType}</p>
                                            </td>
                                            <td className="py-3 px-4">
                                                <Badge>{asset.category}</Badge>
                                            </td>
                                            <td className="py-3 px-4 text-white text-sm">
                                                {formatCurrency(asset.price)}
                                            </td>
                                            <td className="py-3 px-4">
                                                <StatusBadge status={asset.status} type="asset" />
                                            </td>
                                            <td className="py-3 px-4">
                                                <button
                                                    onClick={() => handleToggleFeatured(asset.id, asset.featured)}
                                                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${asset.featured
                                                            ? 'bg-amber-500/20 text-amber-400'
                                                            : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                                                        }`}
                                                    title={asset.featured ? 'Remove from featured' : 'Add to featured'}
                                                >
                                                    <svg className="w-4 h-4" fill={asset.featured ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                                    </svg>
                                                </button>
                                            </td>
                                            <td className="py-3 px-4 text-right">
                                                <Button variant="ghost" size="sm" onClick={() => handleEdit(asset.id)}>
                                                    Edit
                                                </Button>
                                                <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300" onClick={() => handleDelete(asset.id)}>
                                                    Delete
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
