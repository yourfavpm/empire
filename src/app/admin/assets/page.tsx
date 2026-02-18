'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Button, Input, Badge, StatusBadge } from '@/components/ui';
import { formatCurrency, formatDate } from '@/lib/utils';
import { toast } from 'react-hot-toast';

interface StockMetadata {
    available: number;
    sold: number;
    total: number;
}

interface Subcategory {
    id: string;
    title: string;
    price: number;
    publicDescription: string;
    countries: string[];
    category: string;
    categoryId: string;
    stock: StockMetadata;
    logo?: string;
    previewLink?: string;
    tutorialLink?: string;
}

interface Category {
    id: string;
    name: string;
    _count: { subcategories: number };
}

interface AssetUnit {
    id: string;
    lockedDescription: string;
    status: 'AVAILABLE' | 'SOLD';
    purchasedBy?: { name: string, email: string };
    purchasedAt?: string;
    orderId?: string;
}

export default function AdminAssetManagement() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
    const [units, setUnits] = useState<AssetUnit[]>([]);

    const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
    const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<string | null>(null);

    const [loading, setLoading] = useState(true);
    const [showCategoryForm, setShowCategoryForm] = useState(false);
    const [showSubcategoryForm, setShowSubcategoryForm] = useState(false);
    const [showUnitForm, setShowUnitForm] = useState(false);

    // Form States
    const [newCategoryName, setNewCategoryName] = useState('');
    const [newSubTitle, setNewSubTitle] = useState('');
    const [newSubPrice, setNewSubPrice] = useState('');
    const [newSubDesc, setNewSubDesc] = useState('');
    const [newSubCountries, setNewSubCountries] = useState('');
    const [newSubLogo, setNewSubLogo] = useState('');
    const [newSubPreview, setNewSubPreview] = useState('');
    const [newSubPreviewType, setNewSubPreviewType] = useState('URL');
    const [newSubTutorial, setNewSubTutorial] = useState('');
    const [bulkUnits, setBulkUnits] = useState('');

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        if (selectedCategoryId) {
            fetchSubcategories(selectedCategoryId);
            setSelectedSubcategoryId(null);
            setUnits([]);
        }
    }, [selectedCategoryId]);

    useEffect(() => {
        if (selectedSubcategoryId) {
            fetchUnits(selectedSubcategoryId);
        }
    }, [selectedSubcategoryId]);

    const fetchCategories = async () => {
        const res = await fetch('/api/admin/categories');
        const data = await res.json();
        if (res.ok) setCategories(data.categories);
        setLoading(false);
    };

    const fetchSubcategories = async (catId: string) => {
        const res = await fetch(`/api/admin/subcategories?categoryId=${catId}`);
        const data = await res.json();
        if (res.ok) setSubcategories(data.subcategories);
    };

    const fetchUnits = async (subId: string) => {
        const res = await fetch(`/api/admin/asset-units?subcategoryId=${subId}`);
        const data = await res.json();
        if (res.ok) setUnits(data.units);
    };

    const handleCreateCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/admin/categories', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newCategoryName })
            });
            if (res.ok) {
                setNewCategoryName('');
                setShowCategoryForm(false);
                fetchCategories();
                toast.success('Category created successfully');
            } else {
                const data = await res.json();
                toast.error(data.error || 'Failed to create category');
            }
        } catch (error) {
            toast.error('Network error');
        }
    };

    const handleCreateSubcategory = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCategoryId) return;

        try {
            const res = await fetch('/api/admin/subcategories', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: newSubTitle,
                    price: parseFloat(newSubPrice),
                    publicDescription: newSubDesc,
                    countries: newSubCountries.split(',').map(s => s.trim()).filter(Boolean),
                    categoryId: selectedCategoryId,
                    logo: newSubLogo.trim() || null,
                    previewLink: newSubPreview.trim() || null,
                    tutorialLink: newSubTutorial.trim() || null
                })
            });
            if (res.ok) {
                setNewSubTitle('');
                setNewSubPrice('');
                setNewSubDesc('');
                setNewSubCountries('');
                setNewSubLogo('');
                setNewSubPreview('');
                setNewSubTutorial('');
                setShowSubcategoryForm(false);
                fetchSubcategories(selectedCategoryId);
                toast.success('Subcategory created successfully');
            } else {
                const data = await res.json();
                toast.error(data.error || 'Failed to create subcategory');
            }
        } catch (error) {
            toast.error('Network error');
        }
    };

    const handleAddUnits = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedSubcategoryId) return;

        const unitList = bulkUnits.split('\n').map(u => u.trim()).filter(Boolean);
        if (unitList.length === 0) return;

        try {
            const res = await fetch('/api/admin/asset-units', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    subcategoryId: selectedSubcategoryId,
                    units: unitList
                })
            });
            if (res.ok) {
                setBulkUnits('');
                setShowUnitForm(false);
                fetchUnits(selectedSubcategoryId);
                // Also refresh subcategories to update stock count
                if (selectedCategoryId) fetchSubcategories(selectedCategoryId);
                toast.success(`Successfully imported ${unitList.length} units`);
            } else {
                const data = await res.json();
                toast.error(data.error || 'Failed to import units');
            }
        } catch (error) {
            toast.error('Network error');
        }
    };

    const handleDeleteCategory = async (id: string, name: string) => {
        if (!confirm(`Are you sure you want to delete category "${name}"? This action cannot be undone and may cascade delete all subcategories and assets.`)) return;

        try {
            const res = await fetch(`/api/admin/categories?id=${id}`, { method: 'DELETE' });
            if (res.ok) {
                toast.success('Category deleted');
                fetchCategories();
                if (selectedCategoryId === id) {
                    setSelectedCategoryId(null);
                    setSubcategories([]);
                    setUnits([]);
                }
            } else {
                toast.error('Failed to delete category');
            }
        } catch (error) {
            toast.error('Network error');
        }
    };

    const handleDeleteSubcategory = async (id: string, title: string) => {
        if (!confirm(`Are you sure you want to delete product "${title}"? This will delete all associated inventory.`)) return;

        try {
            const res = await fetch(`/api/admin/subcategories?id=${id}`, { method: 'DELETE' });
            if (res.ok) {
                toast.success('Product deleted');
                if (selectedCategoryId) fetchSubcategories(selectedCategoryId);
                if (selectedSubcategoryId === id) {
                    setSelectedSubcategoryId(null);
                    setUnits([]);
                }
            } else {
                toast.error('Failed to delete product');
            }
        } catch (error) {
            toast.error('Network error');
        }
    };

    const handleDeleteUnit = async (id: string) => {
        if (!confirm(`Are you sure you want to delete this unit?`)) return;

        try {
            const res = await fetch(`/api/admin/asset-units?id=${id}`, { method: 'DELETE' });
            if (res.ok) {
                toast.success('Unit removed');
                if (selectedSubcategoryId) fetchUnits(selectedSubcategoryId);
            } else {
                toast.error('Failed to delete unit');
            }
        } catch (error) {
            toast.error('Network error');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-brand tracking-tight uppercase">Inventory Control</h1>
                    <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest font-black">Architecture: Categories → Products → Stock Units</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* STEP 1: Categories */}
                <div className="lg:col-span-3 space-y-4">
                    <Card className="border-slate-200 bg-white shadow-sm overflow-hidden">
                        <CardHeader className="flex flex-row items-center justify-between border-b border-slate-50 bg-slate-50/50 py-3">
                            <CardTitle className="text-[10px] font-black uppercase tracking-widest text-slate-400">Categories</CardTitle>
                            <button onClick={() => setShowCategoryForm(!showCategoryForm)} className="text-[10px] text-brand font-black uppercase hover:underline">+ New Sector</button>
                        </CardHeader>
                        <CardContent className="p-2 space-y-1">
                            {showCategoryForm && (
                                <form onSubmit={handleCreateCategory} className="mb-4 p-4 bg-slate-50 rounded-xl border border-slate-200 shadow-inner">
                                    <Input
                                        placeholder="Sector Name"
                                        value={newCategoryName}
                                        onChange={e => setNewCategoryName(e.target.value)}
                                        className="h-9 text-xs mb-3 font-bold"
                                        required
                                    />
                                    <div className="flex gap-2">
                                        <Button type="submit" size="sm" className="h-8 text-[10px] px-4 font-black uppercase bg-brand">Save</Button>
                                        <Button variant="ghost" size="sm" className="h-8 text-[10px] px-4 font-black uppercase" onClick={() => setShowCategoryForm(false)}>Cancel</Button>
                                    </div>
                                </form>
                            )}
                            {categories.map(cat => (
                                <div key={cat.id} className="relative group">
                                    <button
                                        onClick={() => setSelectedCategoryId(cat.id)}
                                        className={`w-full text-left px-4 py-3 rounded-xl text-xs transition-all font-black uppercase tracking-tight flex justify-between items-center border ${selectedCategoryId === cat.id ? 'bg-brand text-white border-brand shadow-lg' : 'bg-white text-slate-400 border-transparent hover:bg-slate-50 hover:text-brand'}`}
                                    >
                                        {cat.name}
                                        <span className={`${selectedCategoryId === cat.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-400'} text-[9px] px-2 py-0.5 rounded-full font-black`}>{cat._count.subcategories}</span>
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleDeleteCategory(cat.id, cat.name); }}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-red-50 text-red-500 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-100"
                                        title="Delete Category"
                                    >
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                    </button>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>

                {/* STEP 2: Products */}
                <div className="lg:col-span-4 space-y-4">
                    <Card className={`border-slate-200 bg-white shadow-sm overflow-hidden transition-all duration-500 ${!selectedCategoryId ? 'opacity-40 grayscale pointer-events-none scale-95 origin-top' : 'opacity-100'}`}>
                        <CardHeader className="flex flex-row items-center justify-between border-b border-slate-50 bg-slate-50/50 py-3">
                            <CardTitle className="text-[10px] font-black uppercase tracking-widest text-slate-400">Target Products</CardTitle>
                            <button onClick={() => setShowSubcategoryForm(!showSubcategoryForm)} className="text-[10px] text-brand font-black uppercase hover:underline">+ New Product</button>
                        </CardHeader>
                        <CardContent className="p-2">
                            {showSubcategoryForm && (
                                <form onSubmit={handleCreateSubcategory} className="mb-4 p-5 bg-white rounded-2xl border border-slate-200 shadow-xl space-y-6">
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <Input label="Product Title" placeholder="Netflix Premium" value={newSubTitle} onChange={e => setNewSubTitle(e.target.value)} className="h-10 text-xs font-bold" required />
                                            <Input label="Price (NGN)" placeholder="5000" type="number" value={newSubPrice} onChange={e => setNewSubPrice(e.target.value)} className="h-10 text-xs font-bold" required />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Public Description</label>
                                            <textarea placeholder="Describe this asset to customers..." value={newSubDesc} onChange={e => setNewSubDesc(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl p-4 text-xs text-brand font-medium outline-none focus:ring-2 focus:ring-brand/10 min-h-[100px] shadow-sm placeholder:text-slate-200" />
                                        </div>
                                        <Input label="Availability (Comma Separated)" placeholder="Nigeria, Ghana, Global" value={newSubCountries} onChange={e => setNewSubCountries(e.target.value)} className="h-10 text-xs font-bold" />
                                    </div>

                                    <div className="space-y-6 pt-6 border-t border-slate-100">
                                        <p className="text-[10px] uppercase font-black text-brand tracking-widest flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-brand" />
                                            Product Manifest Details
                                        </p>

                                        <div className="space-y-4">
                                            <div>
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Asset Icon</label>
                                                <div className="flex items-center gap-4">
                                                    <div className="flex-1">
                                                        <Input
                                                            type="file"
                                                            accept="image/*"
                                                            onChange={async (e) => {
                                                                const file = e.target.files?.[0];
                                                                if (!file) return;
                                                                const tid = toast.loading('Uploading icon...');
                                                                const fd = new FormData();
                                                                fd.append('file', file);
                                                                const r = await fetch('/api/upload', { method: 'POST', body: fd });
                                                                if (r.ok) {
                                                                    const { url } = await r.json();
                                                                    setNewSubLogo(url);
                                                                    toast.success('Icon Synced', { id: tid });
                                                                }
                                                            }}
                                                            className="h-10"
                                                        />
                                                    </div>
                                                    {newSubLogo && <img src={newSubLogo} alt="" className="w-10 h-10 rounded-lg border border-slate-100 object-contain p-1" />}
                                                </div>
                                                <Input placeholder="Or paste manual icon URL" value={newSubLogo} onChange={e => setNewSubLogo(e.target.value)} className="h-8 text-[10px] mt-2 italic border-slate-100" />
                                            </div>

                                            <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 space-y-4">
                                                <div>
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Preview Content Type</label>
                                                    <div className="flex gap-4">
                                                        {['URL', 'IMAGE', 'FILE'].map((t) => (
                                                            <label key={t} className="flex items-center gap-2 cursor-pointer">
                                                                <input type="radio" value={t} checked={newSubPreviewType === t} onChange={e => setNewSubPreviewType(e.target.value)} className="text-brand focus:ring-brand" />
                                                                <span className="text-[10px] font-black text-slate-500 uppercase">{t}</span>
                                                            </label>
                                                        ))}
                                                    </div>
                                                </div>
                                                {newSubPreviewType === 'URL' ? (
                                                    <Input placeholder="Preview Destination URL" value={newSubPreview} onChange={e => setNewSubPreview(e.target.value)} className="h-10 text-xs font-mono" />
                                                ) : (
                                                    <Input type="file" onChange={async (e) => {
                                                        const file = e.target.files?.[0];
                                                        if (!file) return;
                                                        const tid = toast.loading('Syncing resource...');
                                                        const fd = new FormData();
                                                        fd.append('file', file);
                                                        const r = await fetch('/api/upload', { method: 'POST', body: fd });
                                                        if (r.ok) {
                                                            const { url } = await r.json();
                                                            setNewSubPreview(url);
                                                            toast.success('Mapped', { id: tid });
                                                        }
                                                    }} />
                                                )}
                                            </div>

                                            <Input label="Product Tutorial Link" placeholder="https://..." value={newSubTutorial} onChange={e => setNewSubTutorial(e.target.value)} className="h-10 text-xs font-mono" />
                                        </div>

                                        <div className="flex gap-3">
                                            <Button type="submit" className="flex-1 h-11 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-brand/20">Authorize Deploy</Button>
                                            <Button variant="ghost" className="px-6 h-11 text-[10px] font-black uppercase text-slate-400" onClick={() => setShowSubcategoryForm(false)}>Abort</Button>
                                        </div>
                                    </div>
                                </form>
                            )}

                            <div className="space-y-3">
                                {subcategories.length === 0 && selectedCategoryId && (
                                    <div className="py-20 text-center opacity-30">
                                        <p className="text-[10px] font-black uppercase tracking-widest">No Products Found</p>
                                    </div>
                                )}
                                {subcategories.map(sub => (
                                    <div
                                        key={sub.id}
                                        onClick={() => setSelectedSubcategoryId(sub.id)}
                                        className={`p-5 rounded-2xl border-2 transition-all cursor-pointer group relative ${selectedSubcategoryId === sub.id ? 'bg-white border-brand shadow-xl ring-8 ring-brand/5' : 'bg-white border-slate-50 hover:border-slate-200'}`}
                                    >
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100 overflow-hidden">
                                                    {(sub as any).logo ? <img src={(sub as any).logo} alt="" className="w-full h-full object-contain p-1" /> : <span className="text-xl">📦</span>}
                                                </div>
                                                <h4 className={`text-base font-black tracking-tight ${selectedSubcategoryId === sub.id ? 'text-brand' : 'text-slate-600 group-hover:text-brand'}`}>{sub.title}</h4>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-base font-black text-brand block">{formatCurrency(sub.price)}</span>
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{sub.stock.available} In Stock</span>
                                            </div>
                                        </div>
                                        {selectedSubcategoryId === sub.id && <div className="h-1 w-full bg-brand/10 rounded-full mt-2 overflow-hidden"><div className="h-full bg-brand w-1/3 animate-progress" /></div>}
                                        
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleDeleteSubcategory(sub.id, sub.title); }}
                                            className="absolute top-2 right-2 p-1.5 bg-red-50 text-red-500 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-100 z-10"
                                            title="Delete Product"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* STEP 3: Details & Units */}
                <div className="lg:col-span-5 space-y-6">
                    {selectedSubcategoryId && (
                        <Card className="border-slate-200 bg-white shadow-lg overflow-hidden animate-in fade-in slide-in-from-right-4 duration-500">
                            <CardHeader className="border-b border-slate-50 bg-slate-50/50 flex flex-row items-center justify-between py-4">
                                <CardTitle className="text-[10px] font-black uppercase tracking-widest text-slate-400">Entity Details</CardTitle>
                                <Badge className="bg-brand/5 text-brand border-brand/10 text-[9px] font-black uppercase">Active Deployment</Badge>
                            </CardHeader>
                            <CardContent className="p-6">
                                {(() => {
                                    const sub = subcategories.find(s => s.id === selectedSubcategoryId);
                                    if (!sub) return null;
                                    return (
                                        <div className="space-y-6">
                                            <div className="flex items-center gap-5">
                                                <div className="w-20 h-20 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center p-2 shadow-inner">
                                                    {(sub as any).logo ? <img src={(sub as any).logo} alt="" className="w-full h-full object-contain" /> : <span className="text-3xl">📦</span>}
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="text-2xl font-black text-brand tracking-tighter leading-none mb-2">{sub.title}</h3>
                                                    <div className="flex items-center gap-4">
                                                        <span className="text-xl font-black text-emerald-600">{formatCurrency(sub.price)}</span>
                                                        <Badge variant="outline" className="font-black text-[9px] uppercase border-slate-200">{sub.category}</Badge>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex flex-col items-center text-center">
                                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Stock</p>
                                                    <p className={`text-xl font-black ${sub.stock.available > 0 ? 'text-emerald-600' : 'text-red-500'}`}>{sub.stock.available}</p>
                                                </div>
                                                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex flex-col items-center text-center">
                                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Sales</p>
                                                    <p className="text-xl font-black text-brand">{sub.stock.sold}</p>
                                                </div>
                                            </div>

                                            <div className="space-y-4 pt-4 border-t border-slate-100">
                                                <p className="text-xs text-slate-500 font-bold leading-relaxed">{sub.publicDescription || 'No description provided.'}</p>
                                                <div className="flex flex-wrap gap-2 text-[10px] font-black text-slate-400 uppercase">
                                                    📍 {sub.countries?.join(', ') || 'Global Access'}
                                                </div>
                                                <div className="flex gap-3">
                                                    <Button variant="outline" size="sm" className="flex-1 font-black text-[10px] uppercase h-10 border-slate-200" onClick={() => (sub as any).previewLink && window.open((sub as any).previewLink, '_blank')}>View Preview</Button>
                                                    <Button variant="outline" size="sm" className="flex-1 font-black text-[10px] uppercase h-10 border-slate-200" onClick={() => (sub as any).tutorialLink && window.open((sub as any).tutorialLink, '_blank')}>Tutorial</Button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })()}
                            </CardContent>
                        </Card>
                    )}

                    <Card className={`border-slate-200 bg-white shadow-sm overflow-hidden ${!selectedSubcategoryId ? 'opacity-40 grayscale pointer-events-none' : ''}`}>
                        <CardHeader className="flex flex-row items-center justify-between border-b border-slate-50 bg-slate-50/50 py-3">
                            <CardTitle className="text-[10px] font-black uppercase tracking-widest text-slate-400">Inventory Ledger</CardTitle>
                            <button onClick={() => setShowUnitForm(!showUnitForm)} className="text-[10px] text-brand font-black uppercase hover:underline">+ Inject Stock</button>
                        </CardHeader>
                        <CardContent className="p-2">
                            {showUnitForm && (
                                <form onSubmit={handleAddUnits} className="mb-4 p-5 bg-white rounded-2xl border border-slate-200 shadow-xl space-y-4">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Bulk Sync (One per line)</p>
                                    <textarea
                                        value={bulkUnits}
                                        onChange={e => setBulkUnits(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-100 rounded-xl p-4 text-xs font-mono text-brand outline-none min-h-[150px] focus:ring-2 focus:ring-brand/10 transition-all"
                                        placeholder="data:pass:key..."
                                        required
                                    />
                                    <div className="flex gap-3">
                                        <Button type="submit" className="flex-1 h-10 text-[10px] font-black uppercase">Import</Button>
                                        <Button variant="ghost" className="h-10 text-[10px] font-black uppercase" onClick={() => setShowUnitForm(false)}>Abort</Button>
                                    </div>
                                </form>
                            )}

                            <div className="max-h-[500px] overflow-y-auto space-y-3 p-2 custom-scrollbar">
                                {units.length === 0 && selectedSubcategoryId && (
                                    <div className="py-20 text-center opacity-30">
                                        <p className="text-[10px] font-black uppercase tracking-widest italic">Reserve Depleted</p>
                                    </div>
                                )}
                                {units.map(unit => (
                                    <div key={unit.id} className={`p-4 rounded-xl border transition-all group relative ${unit.status === 'SOLD' ? 'bg-slate-50/50 border-slate-50 opacity-60' : 'bg-white border-slate-100 shadow-sm hover:border-slate-200'}`}>
                                        <div className="flex justify-between items-center mb-3">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-1.5 h-1.5 rounded-full ${unit.status === 'SOLD' ? 'bg-slate-300' : 'bg-emerald-500'}`} />
                                                <span className={`text-[9px] font-black uppercase tracking-widest ${unit.status === 'SOLD' ? 'text-slate-400' : 'text-emerald-600'}`}>{unit.status}</span>
                                            </div>
                                            <span className="text-[9px] font-black text-slate-300">#{unit.id.slice(-8).toUpperCase()}</span>
                                        </div>
                                        <div className="bg-slate-50/50 p-3 rounded-lg border border-slate-50 text-[11px] font-mono text-brand break-all leading-relaxed">
                                            {unit.lockedDescription}
                                        </div>
                                        {unit.status === 'SOLD' && unit.purchasedBy && (
                                            <div className="mt-4 pt-4 border-t border-slate-50 flex justify-between items-center">
                                                <div>
                                                    <p className="text-[10px] font-black text-brand leading-none mb-1">{unit.purchasedBy.name}</p>
                                                    <p className="text-[9px] font-bold text-slate-400">{unit.purchasedBy.email}</p>
                                                </div>
                                                <div className="text-right">
                                                    {unit.orderId && <p className="text-[8px] font-black text-brand/50">REF: {unit.orderId.slice(-6).toUpperCase()}</p>}
                                                    <p className="text-[8px] font-bold text-slate-300 uppercase">{formatDate(unit.purchasedAt!)}</p>
                                                </div>
                                            </div>
                                        )}
                                        
                                        <button
                                            onClick={() => handleDeleteUnit(unit.id)}
                                            className="absolute top-2 right-2 p-1.5 bg-red-50 text-red-500 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-100"
                                            title="Delete Unit"
                                        >
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
