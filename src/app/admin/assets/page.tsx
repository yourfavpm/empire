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
                    categoryId: selectedCategoryId
                })
            });
            if (res.ok) {
                setNewSubTitle('');
                setNewSubPrice('');
                setNewSubDesc('');
                setNewSubCountries('');
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

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">Inventory Management</h1>
                    <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest font-bold">Hierarchy: Category → Subcategory → Unique Units</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* STEP 1: Categories */}
                <div className="lg:col-span-3 space-y-4">
                    <Card className="border-slate-800/50" hover>
                        <CardHeader className="flex flex-row items-center justify-between py-3">
                            <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Categories</CardTitle>
                            <button onClick={() => setShowCategoryForm(!showCategoryForm)} className="text-[10px] text-cyan-400 font-bold hover:underline">+ New</button>
                        </CardHeader>
                        <CardContent className="p-2 space-y-1">
                            {showCategoryForm && (
                                <form onSubmit={handleCreateCategory} className="mb-4 p-2 bg-slate-900 rounded-xl border border-slate-700/50">
                                    <Input
                                        placeholder="Category Name"
                                        value={newCategoryName}
                                        onChange={e => setNewCategoryName(e.target.value)}
                                        className="h-8 text-xs mb-2"
                                        required
                                    />
                                    <div className="flex gap-2">
                                        <Button type="submit" size="sm" className="h-7 text-[10px] px-3">Save</Button>
                                        <Button variant="ghost" size="sm" className="h-7 text-[10px] px-3" onClick={() => setShowCategoryForm(false)}>Cancel</Button>
                                    </div>
                                </form>
                            )}
                            {categories.map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => setSelectedCategoryId(cat.id)}
                                    className={`w-full text-left p-3 rounded-xl text-xs transition-all font-bold flex justify-between items-center border ${selectedCategoryId === cat.id ? 'bg-cyan-600 text-white border-cyan-700 shadow-md' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                                        }`}
                                >
                                    {cat.name}
                                    <span className={`${selectedCategoryId === cat.id ? 'text-white/70' : 'text-slate-400'} text-[10px]`}>{cat._count.subcategories}</span>
                                </button>
                            ))}
                        </CardContent>
                    </Card>
                </div>

                {/* STEP 2: Subcategories (Asset Titles) */}
                <div className="lg:col-span-4 space-y-4">
                    <Card className={`border-slate-800/50 transition-opacity ${!selectedCategoryId ? 'opacity-50 pointer-events-none' : ''}`} hover>
                        <CardHeader className="flex flex-row items-center justify-between py-3">
                            <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Subcategories (Titles)</CardTitle>
                            <button onClick={() => setShowSubcategoryForm(!showSubcategoryForm)} className="text-[10px] text-cyan-400 font-bold hover:underline">+ New Title</button>
                        </CardHeader>
                        <CardContent className="p-2 space-y-2">
                            {showSubcategoryForm && (
                                <form onSubmit={handleCreateSubcategory} className="mb-4 p-3 bg-slate-900 rounded-xl border border-slate-700/50 space-y-3">
                                    <Input placeholder="Subcategory Title (e.g. Aged Twitter)" value={newSubTitle} onChange={e => setNewSubTitle(e.target.value)} className="h-8 text-xs" required />
                                    <Input placeholder="Price (NGN)" type="number" value={newSubPrice} onChange={e => setNewSubPrice(e.target.value)} className="h-8 text-xs" required />
                                    <textarea placeholder="Public Description" value={newSubDesc} onChange={e => setNewSubDesc(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white outline-none focus:border-cyan-500/50" rows={2} />
                                    <Input placeholder="Countries (comma separated)" value={newSubCountries} onChange={e => setNewSubCountries(e.target.value)} className="h-8 text-xs" />
                                    <div className="flex gap-2">
                                        <Button type="submit" size="sm" className="h-7 text-[10px] px-3">Create</Button>
                                        <Button variant="ghost" size="sm" className="h-7 text-[10px] px-3" onClick={() => setShowSubcategoryForm(false)}>Cancel</Button>
                                    </div>
                                </form>
                            )}
                            {subcategories.length === 0 && selectedCategoryId && <p className="text-[10px] text-slate-600 text-center py-4 italic">No subcategories in this category.</p>}
                            {subcategories.map(sub => (
                                <div
                                    key={sub.id}
                                    onClick={() => setSelectedSubcategoryId(sub.id)}
                                    className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${selectedSubcategoryId === sub.id ? 'bg-white border-cyan-500 shadow-lg' : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                                        }`}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className={`text-sm font-bold ${selectedSubcategoryId === sub.id ? 'text-cyan-700' : 'text-slate-900'}`}>{sub.title}</h4>
                                        <span className="text-xs font-black text-cyan-600">{formatCurrency(sub.price)}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-tight">
                                        <div className="flex gap-3">
                                            <span className="text-slate-500">Stock: <span className={sub.stock.available > 0 ? 'text-emerald-600' : 'text-red-600'}>{sub.stock.available}</span></span>
                                            <span className="text-slate-400">Sold: {sub.stock.sold}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>

                {/* STEP 3: Asset Units (Locked Details) */}
                <div className="lg:col-span-5 space-y-4">
                    <Card className={`border-slate-800/50 transition-all ${!selectedSubcategoryId ? 'opacity-50 pointer-events-none' : ''}`} hover>
                        <CardHeader className="flex flex-row items-center justify-between py-3">
                            <div>
                                <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Asset Units (Inventory)</CardTitle>
                                {selectedSubcategoryId && <p className="text-[8px] text-slate-500 mt-0.5 font-mono">{subcategories.find(s => s.id === selectedSubcategoryId)?.title}</p>}
                            </div>
                            <button onClick={() => setShowUnitForm(!showUnitForm)} className="text-[10px] text-cyan-400 font-bold hover:underline">+ Batch Stock</button>
                        </CardHeader>
                        <CardContent className="p-2 space-y-4">
                            {showUnitForm && (
                                <form onSubmit={handleAddUnits} className="mb-4 p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-3">
                                    <p className="text-[9px] text-slate-400 leading-tight">Paste one locked description per line. Each line becomes a unique, sellable asset.</p>
                                    <textarea
                                        placeholder="username:password:recovery&#10;username:password:recovery"
                                        value={bulkUnits}
                                        onChange={e => setBulkUnits(e.target.value)}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-cyan-100 font-mono outline-none focus:border-cyan-500/50"
                                        rows={8}
                                        required
                                    />
                                    <div className="flex gap-2">
                                        <Button type="submit" size="sm" className="h-7 text-[10px] px-3">Import Units</Button>
                                        <Button variant="ghost" size="sm" className="h-7 text-[10px] px-3" onClick={() => setShowUnitForm(false)}>Cancel</Button>
                                    </div>
                                </form>
                            )}

                            <div className="max-h-[600px] overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                                {units.length === 0 && selectedSubcategoryId && <p className="text-[10px] text-slate-600 text-center py-10 italic">Inventory is empty. Add units to start selling.</p>}
                                {units.map(unit => (
                                    <div key={unit.id} className={`p-4 rounded-xl border-2 ${unit.status === 'SOLD' ? 'bg-slate-50 border-slate-200' : 'bg-white border-slate-200 shadow-sm'}`}>
                                        <div className="flex justify-between items-center mb-3">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-2 h-2 rounded-full ${unit.status === 'SOLD' ? 'bg-slate-300' : 'bg-emerald-500'}`} />
                                                <span className={`text-[10px] font-black uppercase tracking-widest ${unit.status === 'SOLD' ? 'text-slate-400' : 'text-emerald-600'}`}>
                                                    {unit.status}
                                                </span>
                                            </div>
                                            <span className="text-[9px] text-slate-400 font-mono font-bold">ID: {unit.id.slice(-8)}</span>
                                        </div>
                                        <p className="text-xs text-slate-700 font-mono bg-slate-50 p-2.5 rounded-lg border border-slate-200 break-all">{unit.lockedDescription}</p>

                                        {unit.status === 'SOLD' && unit.purchasedBy && (
                                            <div className="mt-3 pt-3 border-t border-slate-800/50">
                                                <div className="flex justify-between items-end">
                                                    <div>
                                                        <p className="text-[9px] text-slate-500 font-bold uppercase tracking-tight">Purchased By</p>
                                                        <p className="text-[10px] text-white font-medium">{unit.purchasedBy.name}</p>
                                                        <p className="text-[9px] text-slate-500">{unit.purchasedBy.email}</p>
                                                        {unit.orderId && <p className="text-[8px] text-cyan-500 font-mono mt-1">Order: #{unit.orderId.slice(-6)}</p>}
                                                    </div>
                                                    <p className="text-[9px] text-slate-600 italic">{unit.purchasedAt ? formatDate(unit.purchasedAt) : ''}</p>
                                                </div>
                                            </div>
                                        )}
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
