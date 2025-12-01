"use client";

import { useState, useEffect, useRef } from "react";
import { Flame, Send, AlertCircle, Share2, Loader2, Download } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";

export default function Home() {
    const [url, setUrl] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<{ roast: string; image: string; score: number; pro_tips: string[] } | null>(
        null
    );
    const [error, setError] = useState("");
    const [loadingText, setLoadingText] = useState("Roasting...");
    const [roastCount, setRoastCount] = useState(1240);
    const [persona, setPersona] = useState("ramsay");
    const roastCardRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const loadingPhrases = [
            "Analyzing crooked CSS...",
            "Looking for Comic Sans...",
            "Oh god, who designed this...",
            "Picking the most offensive words...",
            "Calculating toxicity levels...",
            "Consulting with Steve Jobs' ghost...",
            "Trying not to laugh...",
            "Loading emotional damage...",
        ];

        let interval: NodeJS.Timeout;
        if (loading) {
            setLoadingText(loadingPhrases[0]);
            let i = 0;
            interval = setInterval(() => {
                i = (i + 1) % loadingPhrases.length;
                setLoadingText(loadingPhrases[i]);
            }, 2000);
        }
        return () => clearInterval(interval);
    }, [loading]);

    useEffect(() => {
        const interval = setInterval(() => {
            setRoastCount(prev => prev + Math.floor(Math.random() * 3) + 1);
        }, 10000);
        return () => clearInterval(interval);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!url) return;

        // Smart URL: Add https:// if missing
        let processedUrl = url.trim();
        if (!/^https?:\/\//i.test(processedUrl)) {
            processedUrl = `https://${processedUrl}`;
            setUrl(processedUrl); // Update input to show user the change
        }

        setLoading(true);
        setError("");
        setResult(null);

        try {
            const res = await fetch("/api/roast", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url: processedUrl, persona }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Something went wrong");
            }

            setResult(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleShare = () => {
        const text = `My website just got roasted by AI! 🔥 Check it out: ${url}`;
        navigator.clipboard.writeText(text);
        toast.success("Link copied to clipboard!");

        // Optional: Open Twitter as well
        // window.open(
        //     `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`,
        //     "_blank"
        // );
    };

    const handleRandomRoast = () => {
        const sites = [
            'google.com', 'facebook.com', 'amazon.com', 'netflix.com',
            'instagram.com', 'linkedin.com', 'twitter.com', 'reddit.com',
            'wikipedia.org', 'craigslist.org', 'yahoo.com', 'bing.com',
            'apple.com', 'microsoft.com', 'adobe.com', 'spotify.com',
            'airbnb.com', 'uber.com', 'tiktok.com', 'twitch.tv',
            'pinterest.com', 'dropbox.com', 'slack.com', 'zoom.us',
            'salesforce.com', 'oracle.com', 'ibm.com', 'intel.com'
        ];
        const randomSite = sites[Math.floor(Math.random() * sites.length)];
        setUrl(`https://${randomSite}`);
    };

    const handleDownloadCard = async () => {
        if (roastCardRef.current) {
            try {
                const htmlToImage = await import('html-to-image');
                const download = (await import('downloadjs')).default;

                const dataUrl = await htmlToImage.toPng(roastCardRef.current, { quality: 0.95 });
                download(dataUrl, 'roast-card.png');
            } catch (error) {
                console.error('Error generating roast card:', error);
            }
        }
    };

    const handleReset = () => {
        setUrl("");
        setResult(null);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    return (
        <main className="min-h-screen text-white selection:bg-orange-500 selection:text-white">
            <div className="container mx-auto px-4 py-20 max-w-6xl">
                {/* Hero Section */}
                <div className="text-center mb-16 space-y-6">
                    <div className="inline-flex items-center justify-center p-3 bg-orange-500/10 rounded-full mb-4 ring-1 ring-orange-500/20">
                        <Flame className="w-8 h-8 text-orange-500" />
                    </div>
                    <div className="flex justify-center mb-4">
                        <img
                            src="https://media1.tenor.com/m/x8v1oNUOmg4AAAAd/gordon-ramsay-its-raw.gif"
                            alt="IT'S RAW!"
                            className="rounded-lg w-48 h-auto shadow-lg shadow-orange-500/20 rotate-3 hover:rotate-0 transition-transform duration-300"
                        />
                    </div>
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
                        Will Your Website <br />
                        <span className="text-orange-500 text-glow">Survive the Roast?</span>
                    </h1>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                        AI-powered brutal design critique via Gemini. Enter your URL if you
                        dare. No mercy shown.
                    </p>

                    <form onSubmit={handleSubmit} className="max-w-xl mx-auto mt-10">
                        {/* Persona Selector */}
                        <div className="grid grid-cols-3 gap-2 mb-6">
                            {[
                                { id: 'ramsay', name: 'Gordon', emoji: '🤬', desc: "It's RAW!" },
                                { id: 'jobs', name: 'Steve', emoji: '🍏', desc: "Not magical" },
                                { id: 'vc', name: 'VC Bro', emoji: '💸', desc: "Scale it" },
                                { id: 'zoomer', name: 'Zoomer', emoji: '💀', desc: "No cap fr" },
                            ].map((p) => (
                                <button
                                    key={p.id}
                                    type="button"
                                    onClick={() => setPersona(p.id)}
                                    className={`p-3 rounded-xl border transition-all flex flex-col items-center gap-1 ${persona === p.id
                                        ? 'bg-orange-500/20 border-orange-500 text-white'
                                        : 'bg-neutral-900 border-neutral-800 text-gray-400 hover:border-neutral-700'
                                        }`}
                                >
                                    <span className="text-2xl">{p.emoji}</span>
                                    <span className="font-bold text-sm">{p.name}</span>
                                    <span className="text-[10px] opacity-70">{p.desc}</span>
                                </button>
                            ))}
                        </div>

                        <div className="relative group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-orange-600 to-red-600 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-200"></div>
                            <div className="relative flex flex-col md:flex-row items-stretch md:items-center bg-neutral-900 rounded-lg border border-neutral-800 p-2 gap-2 md:gap-0 input-glow transition-all duration-300">
                                <input
                                    type="url"
                                    placeholder="https://your-startup.com"
                                    className="flex-1 bg-transparent border-none outline-none px-4 py-3 text-lg placeholder:text-neutral-600 w-full"
                                    value={url}
                                    onChange={(e) => setUrl(e.target.value)}
                                    required
                                />
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="bg-orange-600 hover:bg-orange-500 text-white px-6 py-3 rounded-md font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed w-full md:w-auto"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            {loadingText}
                                        </>
                                    ) : (
                                        <>
                                            Roast It <Flame className="w-4 h-4" />
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </form>

                    <div className="flex justify-center mt-4">
                        <button
                            type="button"
                            onClick={handleRandomRoast}
                            className="text-sm text-gray-400 hover:text-orange-500 transition-colors flex items-center gap-2"
                        >
                            🎲 Roast a random famous site
                        </button>
                    </div>

                    {
                        error && (
                            <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 flex items-center justify-center gap-2">
                                <AlertCircle className="w-5 h-5" />
                                {error}
                            </div>
                        )
                    }
                </div >

                {/* Results Section */}
                {
                    result && (
                        <div className="animate-in fade-in slide-in-from-bottom-10 duration-700">
                            <div className="grid md:grid-cols-2 gap-8 items-start">
                                {/* Screenshot */}
                                <div className="relative group rounded-xl overflow-hidden border border-neutral-800 bg-neutral-900/50">
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent z-10"></div>
                                    <img
                                        src={result.image}
                                        alt="Website Screenshot"
                                        className="w-full h-auto object-cover"
                                    />
                                    <div className="absolute bottom-4 left-4 z-20">
                                        <p className="text-sm font-medium text-white/80 bg-black/50 px-3 py-1 rounded-full backdrop-blur-sm">
                                            {url}
                                        </p>
                                    </div>
                                </div>

                                {/* Roast Content */}
                                <div className="space-y-6">
                                    <div className="bg-neutral-900/50 border border-neutral-800 rounded-3xl p-8 relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-4 opacity-10">
                                            <Flame className="w-24 h-24 text-orange-500" />
                                        </div>

                                        <h3 className="text-2xl font-bold mb-6 flex items-center gap-3 text-orange-500">
                                            <span className="text-3xl">🔥</span> The Verdict
                                            <span className={`text-4xl font-black ml-auto ${result.score < 3 ? 'text-red-600' : 'text-orange-500'}`}>
                                                {result.score}/10
                                            </span>
                                        </h3>

                                        <div className="prose prose-invert prose-orange max-w-none text-gray-300">
                                            <ReactMarkdown
                                                components={{
                                                    p: ({ node, ...props }) => <p className="mb-6 leading-loose" {...props} />,
                                                    ul: ({ node, ...props }) => <ul className="space-y-3 my-6 list-none" {...props} />,
                                                    li: ({ node, ...props }) => (
                                                        <li className="flex items-start gap-3 leading-relaxed" {...props}>
                                                            <span className="mt-1.5 w-2 h-2 rounded-full bg-orange-500 shrink-0" />
                                                            <span>{props.children}</span>
                                                        </li>
                                                    ),
                                                    strong: ({ node, ...props }) => <strong className="text-white font-bold" {...props} />,
                                                }}
                                            >
                                                {result.roast}
                                            </ReactMarkdown>
                                        </div>

                                        <div className="mt-8 pt-6 border-t border-neutral-800 flex flex-col sm:flex-row justify-between items-center gap-4">
                                            <div className="flex items-center gap-4">
                                                <p className="text-sm text-gray-500">
                                                    Generated by Gemini 3 Pro
                                                </p>
                                            </div>
                                            <div className="flex flex-wrap gap-3 justify-center sm:justify-end">
                                                <button
                                                    onClick={async () => {
                                                        if (!result?.roast) return;
                                                        try {
                                                            const btn = document.getElementById('play-audio-btn');
                                                            if (btn) btn.innerHTML = '<span class="animate-spin">⏳</span>';

                                                            const res = await fetch('/api/speak', {
                                                                method: 'POST',
                                                                headers: { 'Content-Type': 'application/json' },
                                                                body: JSON.stringify({ text: result.roast, persona })
                                                            });

                                                            if (!res.ok) {
                                                                const errData = await res.json();
                                                                throw new Error(errData.error || 'Failed to generate audio');
                                                            }

                                                            const blob = await res.blob();
                                                            const audio = new Audio(URL.createObjectURL(blob));
                                                            audio.play();

                                                            if (btn) btn.innerHTML = '🔊 Play';
                                                        } catch (e: any) {
                                                            console.error(e);
                                                            toast.error(e.message || "Failed to play audio.");
                                                            const btn = document.getElementById('play-audio-btn');
                                                            if (btn) btn.innerHTML = '🔊 Play';
                                                        }
                                                    }}
                                                    id="play-audio-btn"
                                                    className="bg-orange-500/10 hover:bg-orange-500/20 text-orange-500 border border-orange-500/20 px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2"
                                                >
                                                    🔊 Play
                                                </button>

                                                <button
                                                    onClick={handleDownloadCard}
                                                    className="bg-neutral-800 hover:bg-neutral-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2"
                                                >
                                                    <Download className="w-4 h-4" />
                                                    Save
                                                </button>

                                                <button
                                                    onClick={handleShare}
                                                    className="bg-neutral-800 hover:bg-neutral-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2"
                                                >
                                                    <Share2 className="w-4 h-4" />
                                                    Share
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Hidden Roast Card for Image Generation */}
                                    <div className="absolute top-0 left-[-9999px]">
                                        <div ref={roastCardRef} className="w-[800px] bg-neutral-900 p-12 rounded-3xl border border-neutral-800 text-white relative overflow-hidden">
                                            <div className="absolute top-0 right-0 p-8 opacity-10">
                                                <Flame className="w-48 h-48 text-orange-500" />
                                            </div>
                                            <div className="flex items-center gap-4 mb-8">
                                                <div className="p-3 bg-orange-500/10 rounded-full ring-1 ring-orange-500/20">
                                                    <Flame className="w-8 h-8 text-orange-500" />
                                                </div>
                                                <h2 className="text-3xl font-bold">RoastMyLandingPage.ai</h2>
                                            </div>

                                            <div className="flex gap-8 items-start mb-8">
                                                <div className="w-1/2 rounded-xl overflow-hidden border border-neutral-800 shadow-2xl">
                                                    <img src={result.image} className="w-full h-auto object-cover" alt="Site" />
                                                </div>
                                                <div className="w-1/2">
                                                    <div className="flex items-center gap-3 mb-4">
                                                        <span className="text-6xl">🔥</span>
                                                        <span className={`text-6xl font-black ${result.score < 3 ? 'text-red-600' : 'text-orange-500'}`}>
                                                            {result.score}/10
                                                        </span>
                                                    </div>
                                                    <h3 className="text-2xl font-bold text-gray-200 mb-2">{url}</h3>
                                                    <p className="text-gray-400">Verdict by {persona === 'ramsay' ? 'Gordon' : persona === 'jobs' ? 'Steve' : 'VC Bro'}</p>
                                                </div>
                                            </div>

                                            <div className="bg-neutral-950/50 p-6 rounded-xl border border-neutral-800">
                                                <p className="text-xl leading-relaxed text-gray-300 font-medium">
                                                    &quot;{result.roast.split('.')[0]}.&quot;
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Pro Tips Paywall */}
                                    <div className="bg-neutral-900/30 border border-neutral-800 rounded-xl p-8 relative overflow-hidden min-h-[400px]">
                                        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center">
                                            <div className="text-center space-y-4 p-8 bg-neutral-950/90 border border-yellow-500/20 rounded-2xl shadow-2xl shadow-yellow-500/10 backdrop-blur-xl max-w-md mx-4">
                                                <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto ring-1 ring-yellow-500/50 mb-4">
                                                    <span className="text-3xl">🔒</span>
                                                </div>
                                                <h3 className="text-2xl font-bold text-white">Unlock Professional Fixes</h3>
                                                <p className="text-gray-400 text-base">
                                                    Get 3 actionable, expert-level UX improvements to fix these issues immediately.
                                                </p>
                                                <button
                                                    onClick={() => toast.info("Payment gateway integration coming soon!")}
                                                    className="mt-4 bg-gradient-to-r from-yellow-500 to-yellow-400 hover:from-yellow-400 hover:to-yellow-300 text-black font-bold px-10 py-6 rounded-full transition-all transform hover:scale-105 hover:-translate-y-1 shadow-lg shadow-yellow-500/20 hover:shadow-yellow-500/40 text-xl w-full"
                                                >
                                                    Unlock Expert Fixes & Report ($9)
                                                </button>
                                            </div>
                                        </div>

                                        <div
                                            className="blur-md select-none pointer-events-none opacity-60"
                                            style={{
                                                maskImage: 'linear-gradient(to bottom, black 30%, transparent 100%)',
                                                WebkitMaskImage: 'linear-gradient(to bottom, black 30%, transparent 100%)'
                                            }}
                                        >
                                            <h3 className="text-2xl font-bold mb-6 flex items-center gap-3 text-green-500">
                                                <span className="text-3xl">💡</span> Pro Tips
                                            </h3>
                                            <ul className="space-y-8">
                                                {result.pro_tips?.map((tip, index) => (
                                                    <li key={index} className="flex items-start gap-4">
                                                        <div className="w-8 h-8 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center text-base font-bold shrink-0 mt-1">
                                                            {index + 1}
                                                        </div>
                                                        <p className="text-gray-300 leading-relaxed text-lg">{tip}</p>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleReset}
                                        className="w-full py-4 rounded-xl border-2 border-orange-500 text-orange-500 font-bold text-lg hover:bg-orange-500/10 transition-colors flex items-center justify-center gap-2"
                                    >
                                        🔥 Roast Another Site
                                    </button>
                                </div>
                            </div>
                        </div>
                    )
                }

                {/* Social Proof Section */}
                <div className="mt-20 border-t border-neutral-800 pt-16">
                    <div className="text-center mb-12">
                        <p className="text-orange-500 font-medium mb-2">🔥 {roastCount.toLocaleString()} sites roasted in the last 24h</p>
                        <h2 className="text-3xl font-bold text-white">Latest Victims</h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6 mb-12">
                        {[
                            { domain: "tesla.com", score: 3, review: "Boring corporate minimalism at its peak. It looks like a template from 2015 that forgot to load the CSS. Where is the soul? It's just a car configurator masquerading as a lifestyle brand. Zero personality, just cold, hard, expensive emptiness." },
                            { domain: "apple.com", score: 7, review: "Pretentious but clean. We get it, you like white space and scroll-jacking. The animations are smoother than my life, but navigating this site feels like walking through a museum where you're not allowed to touch anything. It's 'magical' in the most annoying way possible." },
                            { domain: "indiehackers.com", score: 4, review: "The forum from 2005 called, they want their layout back. It's a wall of text that screams 'I built this in a weekend'. The information density is high, but so is the headache I get looking at it. It smells like stale coffee and desperate hustle culture." }
                        ].map((site, i) => (
                            <div key={i} className="glass-card p-6 rounded-xl hover:border-orange-500/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-orange-500/10">
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="font-bold text-lg text-white">{site.domain}</h3>
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${site.score < 5 ? 'bg-red-500/20 text-red-400' : 'bg-orange-500/20 text-orange-400'}`}>
                                        {site.score}/10
                                    </span>
                                </div>
                                <p className="text-gray-400 text-sm leading-relaxed">&quot;{site.review}&quot;</p>
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-center">
                        <a
                            href="/gallery"
                            className="group relative inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-orange-600 to-red-600 rounded-full font-bold text-lg text-white shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 hover:scale-105 transition-all duration-300"
                        >
                            <span>Enter the Hall of Shame</span>
                            <span className="group-hover:translate-x-1 transition-transform">→</span>
                        </a>
                    </div>
                </div>
            </div >
        </main >
    );
}
