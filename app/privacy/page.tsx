import React from 'react';

export default function Privacy() {
    return (
        <main className="min-h-screen text-white py-20 px-4">
            <div className="max-w-3xl mx-auto space-y-8">
                <h1 className="text-4xl font-bold text-orange-500 mb-8">Privacy Policy</h1>

                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold">1. Information Collection</h2>
                    <p className="text-gray-400">
                        We collect the URLs you submit for analysis. We may also collect anonymous usage data to improve our service. We do not collect personal information unless explicitly provided by you (e.g., for payment processing).
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold">2. Use of Information</h2>
                    <p className="text-gray-400">
                        The URLs submitted may be publicly displayed in our "Hall of Shame" or gallery. By submitting a URL, you acknowledge that the analysis and screenshot of the site may be made public.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold">3. Cookies</h2>
                    <p className="text-gray-400">
                        We use cookies to enhance your experience, such as remembering your voting history or preferences.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold">4. Third-Party Services</h2>
                    <p className="text-gray-400">
                        We use third-party services for AI generation (Google Gemini) and hosting (Vercel, Supabase). These parties have their own privacy policies.
                    </p>
                </section>
            </div>
        </main>
    );
}
