import { GoogleGenerativeAI } from "@google/generative-ai";

// 1. Knowledge Base (Prototype: In-memory for simplicity)
const KNOWLEDGE_BASE = [
    {
        category: "SaaS",
        content: "For SaaS landing pages, the primary CTA must be above the fold and focused on 'Start Free Trial' or 'Book Demo'. Avoid vague headlines.",
        embedding: [] as number[], // To be filled or pre-calculated
    },
    {
        category: "Design",
        content: "Whitespace is critical. Cluttered designs reduce conversion by 20%. Use 60-30-10 color rule.",
        embedding: [],
    },
    {
        category: "Copywriting",
        content: "Speak to the pain point, not the features. 'Save 10 hours a week' is better than 'Automated scheduling feature'.",
        embedding: [],
    },
    {
        category: "Social Proof",
        content: "Testimonials must look authentic. Use real faces and names. generic 'Company User' quotes reduce trust.",
        embedding: [],
    }
];

// 2. Generate Embedding (Gemini)
async function getEmbedding(text: string) {
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");
    const model = genAI.getGenerativeModel({ model: "text-embedding-004" });

    const result = await model.embedContent(text);
    return result.embedding.values;
}

// 3. RAG Retrieval Function
export async function getContextForRoast(pageText: string): Promise<string> {
    try {
        const queryEmbedding = await getEmbedding(pageText);

        // In a real app, these would be fetched from Supabase pgvector
        // await supabase.rpc('match_documents', { query_embedding: ... })

        // Simulating retrieval
        return "Tip: Ensure high contrast on CTAs. Tip: Use social proof near pricing.";

    } catch (e) {
        console.error("RAG Error (Gemini):", e);
        return "";
    }
}

