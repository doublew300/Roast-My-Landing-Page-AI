"use client";

import { useState, useEffect } from "react";
import { Flame, Search, ArrowLeft } from "lucide-react";

export default function GalleryPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [activeTab, setActiveTab] = useState<'all' | 'worst'>('all');
    const [roasts, setRoasts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRoasts();
    }, [activeTab]);

    const fetchRoasts = async () => {
        setLoading(true);
        try {
            console.log("Fetching roasts...");
            const res = await fetch(`/api/roasts?sort=${activeTab === 'worst' ? 'worst' : 'newest'}&limit=50&t=${Date.now()}`, {
                cache: 'no-store'
            });
            console.log("Response status:", res.status);
            const data = await res.json();
            console.log("Fetched data:", data);
            setRoasts(data);
        } catch (error) {
            console.error("Failed to fetch roasts", error);
        } finally {
            setLoading(false);
        }
    };

    const [votedIds, setVotedIds] = useState<Set<string>>(new Set());

    useEffect(() => {
        const storedVotes = localStorage.getItem('roast_votes');
        if (storedVotes) {
            setVotedIds(new Set(JSON.parse(storedVotes)));
        }
    }, []);

    const handleVote = async (id: string) => {
        if (votedIds.has(id)) return;

        // Optimistic update
        setRoasts(prev => prev.map(r => r.id === id ? { ...r, votes: (r.votes || 0) + 1 } : r));

        // Update local storage
        const newVotedIds = new Set(votedIds);
        newVotedIds.add(id);
        setVotedIds(newVotedIds);
        localStorage.setItem('roast_votes', JSON.stringify(Array.from(newVotedIds)));

        try {
            await fetch('/api/vote', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id })
            });
        } catch (error) {
            console.error("Failed to vote", error);
        }
    };

    const filteredRoasts = roasts.filter(roast =>
        (roast.url || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (roast.roast || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <main className="min-h-screen text-white selection:bg-orange-500 selection:text-white">
            <div className="container mx-auto px-4 py-12 max-w-6xl">
                <div className="flex items-center justify-between mb-12">
                    <a href="/" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group">
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        Back to Roast
                    </a>
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-orange-500/10 rounded-full ring-1 ring-orange-500/20">
                            <Flame className="w-5 h-5 text-orange-500" />
                        </div>
                        <span className="font-bold text-lg">RoastMyLandingPage</span>
                    </div>
                </div>

                <div className="text-center mb-16 space-y-6 relative">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-orange-500/20 blur-[100px] -z-10 rounded-full pointer-events-none"></div>
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
                        Hall of <span className="text-orange-500 text-glow">Shame</span>
                    </h1>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
                        A collection of the internet's biggest victims. <br />
                        See who survived the roast and who got burned.
                    </p>
                </div>

                {/* Tabs */}
                <div className="flex justify-center mb-12">
                    <div className="bg-neutral-900/80 backdrop-blur-md p-1.5 rounded-full border border-neutral-800 flex shadow-2xl">
                        <button
                            onClick={() => setActiveTab('all')}
                            className={`px-8 py-3 rounded-full font-bold transition-all duration-300 ${activeTab === 'all'
                                ? 'bg-neutral-800 text-white shadow-lg ring-1 ring-white/10'
                                : 'text-gray-500 hover:text-gray-300'
                                }`}
                        >
                            All Victims
                        </button>
                        <button
                            onClick={() => setActiveTab('worst')}
                            className={`px-8 py-3 rounded-full font-bold transition-all duration-300 flex items-center gap-2 ${activeTab === 'worst'
                                ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg shadow-orange-500/20'
                                : 'text-gray-500 hover:text-gray-300'
                                }`}
                        >
                            🏆 Worst of the Week
                        </button>
                    </div>
                </div>

                <div className="max-w-xl mx-auto mb-16 relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-orange-600 to-red-600 rounded-full blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-500" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search for a victim..."
                            className="w-full bg-neutral-900/90 border border-neutral-800 rounded-full py-4 pl-14 pr-6 text-white placeholder:text-neutral-600 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 transition-all shadow-xl"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="grid md:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="h-[300px] bg-neutral-900/30 rounded-3xl animate-pulse border border-neutral-800/50"></div>
                        ))}
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredRoasts.map((site, i) => (
                            <div key={site.id || i} className="group glass-card rounded-3xl overflow-hidden hover:border-orange-500/30 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-orange-500/10 flex flex-col">
                                {/* Image / Header */}
                                <div className="h-48 bg-neutral-950 relative overflow-hidden border-b border-neutral-800/50">
                                    {site.image_url ? (
                                        <img
                                            src={site.image_url}
                                            alt={site.url}
                                            className="w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-neutral-900 to-neutral-950 flex items-center justify-center">
                                            <Flame className="w-12 h-12 text-neutral-800 group-hover:text-orange-500/20 transition-colors duration-500" />
                                        </div>
                                    )}
                                    <div className="absolute top-4 right-4">
                                        <span className={`px-3 py-1.5 rounded-full text-sm font-black backdrop-blur-md border border-white/10 shadow-xl ${site.score < 4 ? 'bg-red-500/90 text-white' :
                                                site.score < 7 ? 'bg-orange-500/90 text-white' :
                                                    'bg-green-500/90 text-white'
                                            }`}>
                                            {site.score}/10
                                        </span>
                                    </div>
                                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 via-black/50 to-transparent">
                                        <h3 className="font-bold text-lg text-white truncate">{site.url?.replace(/^https?:\/\//, '').replace(/\/$/, '')}</h3>
                                    </div>
                                </div>

                                <div className="p-6 flex flex-col flex-grow">
                                    <p className="text-gray-400 text-sm leading-relaxed mb-6 flex-grow line-clamp-4 italic">
                                        "{site.roast}"
                                    </p>

                                    <div className="pt-4 border-t border-white/5 flex justify-between items-center">
                                        <span className="text-xs font-medium text-neutral-500 flex items-center gap-1">
                                            {activeTab === 'worst' && i < 3 ? ['🥇', '🥈', '🥉'][i] : '🤖'}
                                            {new Date(site.created_at).toLocaleDateString()}
                                        </span>
                                        <button
                                            onClick={() => handleVote(site.id)}
                                            disabled={votedIds.has(site.id)}
                                            className={`px-4 py-2 rounded-full text-sm font-bold transition-all flex items-center gap-2 ${votedIds.has(site.id)
                                                ? 'bg-orange-500/10 text-orange-500 cursor-default ring-1 ring-orange-500/20'
                                                : 'bg-neutral-800 text-gray-400 hover:bg-orange-500 hover:text-white hover:shadow-lg hover:shadow-orange-500/20'
                                                }`}
                                        >
                                            🔥 {site.votes || 0}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {
                    !loading && filteredRoasts.length === 0 && (
                        <div className="text-center py-32">
                            <div className="inline-flex p-6 bg-neutral-900/50 rounded-full mb-6">
                                <Search className="w-12 h-12 text-gray-600" />
                            </div>
                            <p className="text-2xl font-bold text-gray-300">No victims found</p>
                            <p className="text-gray-500 mt-2">Maybe they're hiding from the roast?</p>
                        </div>
                    )
                }
            </div>
        </main>
    );
}
