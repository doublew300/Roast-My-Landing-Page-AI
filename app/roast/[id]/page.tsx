import { supabase } from "@/lib/supabase";
import { Flame, Download, Share2, AlertCircle } from "lucide-react";
import ReactMarkdown from "react-markdown";
import Link from "next/link";
import { Metadata } from "next";

export const revalidate = 60; // Revalidate every 60 seconds

async function getRoast(id: string) {
    const { data, error } = await supabase
        .from('roasts')
        .select('*')
        .eq('id', id)
        .single();

    if (error) return null;
    return data;
}

type Props = {
    params: { id: string }
}

export async function generateMetadata(
    { params }: Props,
): Promise<Metadata> {
    const roast = await getRoast(params.id);

    if (!roast) {
        return {
            title: 'Roast Not Found',
        }
    }

    const title = `Roast of ${roast.url} - ${roast.score}/10 | RoastMyLandingPage.ai`;
    const description = roast.roast.substring(0, 160) + "...";

    return {
        title: title,
        description: description,
        openGraph: {
            title: title,
            description: description,
            images: [roast.image_url],
        },
        twitter: {
            card: 'summary_large_image',
            title: title,
            description: description,
            images: [roast.image_url],
        },
    }
}

export default async function RoastPage({ params }: Props) {
    const roast = await getRoast(params.id);

    if (!roast) {
        return (
            <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-4xl font-bold mb-4">Roast Not Found</h1>
                    <Link href="/" className="text-orange-500 hover:underline">Go Home</Link>
                </div>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-neutral-950 text-white selection:bg-orange-500 selection:text-white">
            <div className="container mx-auto px-4 py-20 max-w-6xl">
                <div className="mb-8">
                    <Link href="/gallery" className="text-gray-400 hover:text-orange-500 transition-colors flex items-center gap-2">
                        ← Back to Hall of Shame
                    </Link>
                </div>

                <div className="animate-in fade-in slide-in-from-bottom-10 duration-700">
                    <div className="grid md:grid-cols-2 gap-8 items-start">
                        {/* Screenshot */}
                        <div className="relative group rounded-xl overflow-hidden border border-neutral-800 bg-neutral-900/50">
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent z-10"></div>
                            <img
                                src={roast.image_url}
                                alt={`Roast of ${roast.url}`}
                                className="w-full h-auto object-cover"
                            />
                            <div className="absolute bottom-4 left-4 z-20">
                                <p className="text-sm font-medium text-white/80 bg-black/50 px-3 py-1 rounded-full backdrop-blur-sm">
                                    {roast.url}
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
                                    <span className={`text-4xl font-black ml-auto ${roast.score < 3 ? 'text-red-600' : 'text-orange-500'}`}>
                                        {roast.score}/10
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
                                        {roast.roast}
                                    </ReactMarkdown>
                                </div>

                                <div className="mt-8 pt-6 border-t border-neutral-800 flex justify-between items-center">
                                    <p className="text-sm text-gray-500">
                                        Generated by Gemini 3 Pro
                                    </p>
                                    <div className="flex gap-4">
                                        {/* Note: Share functionality would need client-side component or simple link */}
                                        <Link
                                            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out this brutal AI roast of ${roast.url}! 🔥`)}&url=${encodeURIComponent(`https://roast-my-landing-page.ai/roast/${roast.id}`)}`}
                                            target="_blank"
                                            className="text-white hover:text-orange-500 transition-colors flex items-center gap-2 text-sm font-medium"
                                        >
                                            <Share2 className="w-4 h-4" />
                                            Share
                                        </Link>
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
                                        <button className="mt-4 bg-gradient-to-r from-yellow-500 to-yellow-400 hover:from-yellow-400 hover:to-yellow-300 text-black font-bold px-10 py-6 rounded-full transition-all transform hover:scale-105 hover:-translate-y-1 shadow-lg shadow-yellow-500/20 hover:shadow-yellow-500/40 text-xl w-full">
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
                                        {roast.pro_tips?.map((tip: string, index: number) => (
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

                            <Link
                                href="/"
                                className="w-full py-4 rounded-xl border-2 border-orange-500 text-orange-500 font-bold text-lg hover:bg-orange-500/10 transition-colors flex items-center justify-center gap-2"
                            >
                                🔥 Roast Another Site
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
