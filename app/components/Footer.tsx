import Link from "next/link";

export default function Footer() {
    return (
        <footer className="border-t border-neutral-900 bg-neutral-950 py-12 mt-20">
            <div className="container mx-auto px-4 text-center">
                <div className="flex flex-col items-center gap-6">
                    <div className="flex gap-6 text-sm text-neutral-500">
                        <Link href="/terms" className="hover:text-orange-500 transition-colors">
                            Terms of Service
                        </Link>
                        <Link href="/privacy" className="hover:text-orange-500 transition-colors">
                            Privacy Policy
                        </Link>
                    </div>

                    <div className="space-y-2">
                        <p className="text-neutral-600 text-sm">
                            Copyright © 2025 RoastMySite AI.
                        </p>
                        <p className="text-neutral-600 text-sm">
                            Built with 🧡 by <span className="text-orange-500">DoubleW300</span>
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
}
