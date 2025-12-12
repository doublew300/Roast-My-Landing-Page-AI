import { GoogleGenerativeAI } from "@google/generative-ai";
import { RoastResponse } from "./types";

export async function generateRoast(imageBuffer: Buffer, persona: string = 'ramsay'): Promise<RoastResponse> {
    try {
        const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");
        const model = genAI.getGenerativeModel({
            model: "gemini-3-pro-preview", // Updated to stable model name if applicable, or keep as used
            generationConfig: { responseMimeType: "application/json" }
        });

        let systemPrompt = "";
        switch (persona) {
            case 'jobs':
                systemPrompt = `You are Steve Jobs. You are a perfectionist, obsessed with aesthetics, simplicity, and "soul". You hate clutter, ugly fonts, and lack of "magic". Roast this landing page. Be disappointed, condescending, but insightful. Use words like "garbage", "shit", "no soul", "not magical". Use emojis like 🍏, 🖤, 🕶️ to express your minimalist disdain.`;
                break;
            case 'vc':
                systemPrompt = `You are a Silicon Valley VC. You are obsessed with monetization, scalability, unit economics, and "growth hacking". Roast this landing page. Ask about MRR, CAC, LTV. Use buzzwords like "pivot", "scale", "flywheel", "churn". Be dismissive if it doesn't look like a unicorn. Use emojis like 🚀, 💸, 📉, 🦄.`;
                break;
            case 'zoomer':
                systemPrompt = `You are a Gen Z Zoomer design critic. You speak in brainrot slang (skibidi, rizz, no cap, fr fr, mid, cringe, L, W). Roast this landing page for being "boomer" or "cheugy". Be hilarious but actually point out bad design. Use A LOT of emojis like 💀, 😭, 🧢, 🤡, 🔥.`;
                break;
            default: // ramsay
                systemPrompt = `You are Gordon Ramsay. You are aggressive, cynical, and sarcastic. Roast this landing page brutally. Swear (censored like f##k), yell, and be mean. Point out crooked design, bad copy, and lack of trust. Use emojis like 🤬, 🍩, 🤢, 🔥 to emphasize your anger.`;
                break;
        }

        const prompt = `${systemPrompt} 
        
        step-by-step reasoning:
        1. Analyze the visual hierarchy and color palette.
        2. Evaluate the clarity of the value proposition.
        3. Identify 3 specific friction points for the user.
        
        Based on this analysis, generate the roast.
        
        Point out 3 specific things that suck. Be funny but insightful. Keep it under 200 words. Use markdown formatting. IMPORTANT: Use emojis in your response to make it expressive.

        Return the response in this strictly valid JSON format, enclosed in a markdown code block:
        \`\`\`json
        {
            "score": number, // A score from 1 to 10 where 1 is absolute garbage and 10 is perfection. Be harsh.
            "roast": string, // The markdown roast text
            "pro_tips": string[] // Array of 3 highly actionable, professional, serious UX/CRO improvements that would fix the issues mentioned.
        }
        \`\`\``;

        const imagePart = {
            inlineData: {
                data: imageBuffer.toString("base64"),
                mimeType: "image/png",
            },
        };

        const result = await model.generateContent([prompt, imagePart]);
        const response = await result.response;
        const text = response.text();

        // Robust JSON extraction for Chain-of-Thought responses
        // 1. Try extracting from code block
        const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/```\n([\s\S]*?)\n```/);
        let cleanText = "";

        if (jsonMatch && jsonMatch[1]) {
            cleanText = jsonMatch[1].trim();
        } else {
            // 2. Fallback: Find first { and last }
            const firstBrace = text.indexOf('{');
            const lastBrace = text.lastIndexOf('}');
            if (firstBrace !== -1 && lastBrace !== -1) {
                cleanText = text.substring(firstBrace, lastBrace + 1);
            } else {
                cleanText = text; // Hope for the best
            }
        }

        try {
            const jsonResponse = JSON.parse(cleanText) as RoastResponse;
            return jsonResponse;
        } catch (e) {
            console.error("Failed to parse Gemini JSON. Raw text:", text);
            throw new Error("AI response was not valid JSON.");
        }

    } catch (error) {
        console.error("Gemini generation failed:", error);
        throw new Error("Failed to generate roast from AI.");
    }
}
