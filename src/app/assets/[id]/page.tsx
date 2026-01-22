'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Navbar, Footer } from '@/components/layout';
import { Button, Card, Badge, StatusBadge } from '@/components/ui';
import { formatCurrency } from '@/lib/utils';

interface Asset {
    id: string;
    title: string;
    category: string;
    platformType: string;
    price: number;
    shortDescription: string;
    fullDescription: string | null;
    images: string[];
    documents: string[];
    status: string;
    isUnlocked: boolean;
    unlockCount: number;
}

export default function AssetDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const { data: session, status: authStatus } = useSession();
    const [asset, setAsset] = useState<Asset | null>(null);
    const [loading, setLoading] = useState(true);
    const [unlocking, setUnlocking] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchAsset();
    }, [id]);

    const fetchAsset = async () => {
        try {
            const response = await fetch(`/api/assets/${id}`);
            const data = await response.json();

            if (response.ok) {
                setAsset(data.asset);
            } else {
                setError(data.error || 'Asset not found');
            }
        } catch (error) {
            setError('Failed to load asset');
        } finally {
            setLoading(false);
        }
    };

    const handleUnlock = async () => {
        if (!session) {
            router.push('/login');
            return;
        }

        setUnlocking(true);
        setError('');

        try {
            const response = await fetch(`/api/assets/${id}/unlock`, {
                method: 'POST',
            });

            const data = await response.json();

            if (response.ok) {
                // Refresh asset data
                fetchAsset();
            } else {
                if (data.error === 'Insufficient wallet balance') {
                    setError(`Insufficient balance. Need ${formatCurrency(data.required)}, have ${formatCurrency(data.available)}`);
                } else {
                    setError(data.error || 'Failed to unlock asset');
                }
            }
        } catch (error) {
            setError('Something went wrong');
        } finally {
            setUnlocking(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col">
                <Navbar />
                <main className="flex-1 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
                    <div className="max-w-4xl mx-auto">
                        <Card className="animate-pulse">
                            <div className="h-64 bg-slate-700 rounded-lg mb-6" />
                            <div className="h-8 bg-slate-700 rounded w-3/4 mb-4" />
                            <div className="h-4 bg-slate-700 rounded w-1/2 mb-2" />
                            <div className="h-4 bg-slate-700 rounded w-full" />
                        </Card>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    if (error && !asset) {
        return (
            <div className="min-h-screen flex flex-col">
                <Navbar />
                <main className="flex-1 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
                    <div className="max-w-4xl mx-auto text-center">
                        <div className="text-6xl mb-4">😕</div>
                        <h2 className="text-2xl font-bold text-white mb-2">Asset Not Found</h2>
                        <p className="text-slate-400 mb-6">{error}</p>
                        <Link href="/assets">
                            <Button>Back to Assets</Button>
                        </Link>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    if (!asset) return null;

    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />

            <main className="flex-1 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                    {/* Back Button */}
                    <Link href="/assets" className="inline-flex items-center text-slate-400 hover:text-white mb-6">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back to Assets
                    </Link>

                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Main Content */}
                        <div className="lg:col-span-2">
                            <Card>
                                {/* Image */}
                                <div className="relative h-64 bg-gradient-to-br from-violet-600/20 to-indigo-600/20 rounded-lg mb-6 flex items-center justify-center overflow-hidden">
                                    {asset.images.length > 0 ? (
                                        <img
                                            src={asset.images[0]}
                                            alt={asset.title}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <svg className="w-16 h-16 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                        </svg>
                                    )}
                                    {asset.isUnlocked && (
                                        <div className="absolute top-4 right-4">
                                            <Badge variant="success">Unlocked</Badge>
                                        </div>
                                    )}
                                </div>

                                {/* Title & Meta */}
                                <h1 className="text-3xl font-bold text-white mb-4">{asset.title}</h1>

                                <div className="flex flex-wrap items-center gap-3 mb-6">
                                    <Badge>{asset.category}</Badge>
                                    <Badge variant="info">{asset.platformType}</Badge>
                                    <span className="text-sm text-slate-400">
                                        {asset.unlockCount} {asset.unlockCount === 1 ? 'purchase' : 'purchases'}
                                    </span>
                                </div>

                                {/* Description */}
                                <div className="prose prose-invert max-w-none">
                                    <h3 className="text-lg font-semibold text-white mb-3">Description</h3>
                                    <p className="text-slate-300">{asset.shortDescription}</p>

                                    {asset.isUnlocked && asset.fullDescription ? (
                                        <>
                                            <h3 className="text-lg font-semibold text-white mt-6 mb-3">Full Details</h3>
                                            <div className="text-slate-300 whitespace-pre-wrap">
                                                {asset.fullDescription}
                                            </div>
                                        </>
                                    ) : (
                                        <div className="mt-6 p-6 bg-slate-800/50 border border-slate-700/50 rounded-xl text-center">
                                            <svg className="w-12 h-12 text-slate-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                            </svg>
                                            <h4 className="text-white font-medium mb-1">Full Details Locked</h4>
                                            <p className="text-sm text-slate-400">Unlock this asset to view complete information and download files</p>
                                        </div>
                                    )}
                                </div>

                                {/* Documents (if unlocked) */}
                                {asset.isUnlocked && asset.documents.length > 0 && (
                                    <div className="mt-8">
                                        <h3 className="text-lg font-semibold text-white mb-4">Files & Downloads</h3>
                                        <div className="space-y-2">
                                            {asset.documents.map((doc, index) => (
                                                <a
                                                    key={index}
                                                    href={doc}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center p-3 bg-slate-800/50 border border-slate-700/50 rounded-lg hover:border-violet-500/50 transition-colors"
                                                >
                                                    <svg className="w-5 h-5 text-violet-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                                    </svg>
                                                    <span className="text-slate-300">Document {index + 1}</span>
                                                    <svg className="w-4 h-4 text-slate-500 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                    </svg>
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </Card>
                        </div>

                        {/* Sidebar */}
                        <div className="lg:col-span-1">
                            <Card className="sticky top-24">
                                <div className="text-center mb-6">
                                    <span className="text-3xl font-bold text-white">
                                        {formatCurrency(asset.price)}
                                    </span>
                                </div>

                                {error && (
                                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm mb-4">
                                        {error}
                                    </div>
                                )}

                                {asset.isUnlocked ? (
                                    <div className="text-center">
                                        <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                        <h3 className="text-lg font-semibold text-white mb-2">You Own This Asset</h3>
                                        <p className="text-sm text-slate-400">Full access granted. View all details and files above.</p>
                                    </div>
                                ) : (
                                    <>
                                        <Button
                                            className="w-full mb-4"
                                            onClick={handleUnlock}
                                            loading={unlocking}
                                        >
                                            {authStatus === 'authenticated' ? 'Unlock Now' : 'Sign In to Unlock'}
                                        </Button>

                                        {authStatus === 'authenticated' && (
                                            <Link href="/buyer/wallet" className="block">
                                                <Button variant="outline" className="w-full">
                                                    Fund Wallet
                                                </Button>
                                            </Link>
                                        )}

                                        <div className="mt-6 space-y-3 text-sm text-slate-400">
                                            <div className="flex items-center">
                                                <svg className="w-5 h-5 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                                Instant access after unlock
                                            </div>
                                            <div className="flex items-center">
                                                <svg className="w-5 h-5 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                                Full details & documents
                                            </div>
                                            <div className="flex items-center">
                                                <svg className="w-5 h-5 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                                Lifetime access
                                            </div>
                                        </div>
                                    </>
                                )}
                            </Card>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
