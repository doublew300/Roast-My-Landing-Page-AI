import { GoogleGenerativeAI } from "@google/generative-ai";
import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";
import { NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';

export const maxDuration = 90; // Allow longer timeout for screenshot + AI
export const dynamic = "force-dynamic";

const LOCAL_CHROME_EXECUTABLE =
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { url, persona = 'ramsay' } = body;

        if (!url) {
            return NextResponse.json({ error: "URL is required" }, { status: 400 });
        }

        // Initialize Supabase client locally
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
        const supabase = createClient(supabaseUrl, supabaseAnonKey);

        // 1. Capture Screenshot
        let browser;
        try {
            if (process.env.NODE_ENV === "development") {
                browser = await puppeteer.launch({
                    args: ["--no-sandbox", "--disable-setuid-sandbox"],
                    executablePath: LOCAL_CHROME_EXECUTABLE, // Adjust for your local machine
                    headless: true,
                });
            } else {
                browser = await puppeteer.launch({
                    args: chromium.args,
                    defaultViewport: chromium.defaultViewport,
                    executablePath: await chromium.executablePath(),
                    headless: chromium.headless,
                });
            }

            const page = await browser.newPage();
            await page.setViewport({ width: 1280, height: 800 });
            await page.goto(url, { waitUntil: "load", timeout: 60000 });

            // Add a small delay to ensure animations/lazy loading finish
            await new Promise(r => setTimeout(r, 2000));

            const screenshotBuffer = await page.screenshot({ type: "png" });
            await browser.close();

            const base64Image = screenshotBuffer.toString("base64");

            // 2. Generate Roast with Gemini
            const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");
            const model = genAI.getGenerativeModel({
                model: "gemini-3-pro-preview",
                generationConfig: { responseMimeType: "application/json" }
            });

            let systemPrompt = "";
            if (persona === 'jobs') {
                systemPrompt = `You are Steve Jobs. You are a perfectionist, obsessed with aesthetics, simplicity, and "soul". You hate clutter, ugly fonts, and lack of "magic". Roast this landing page. Be disappointed, condescending, but insightful. Use words like "garbage", "shit", "no soul", "not magical". Use emojis like 🍏, 🖤, 🕶️ to express your minimalist disdain.`;
            } else if (persona === 'vc') {
                systemPrompt = `You are a Silicon Valley VC. You are obsessed with monetization, scalability, unit economics, and "growth hacking". Roast this landing page. Ask about MRR, CAC, LTV. Use buzzwords like "pivot", "scale", "flywheel", "churn". Be dismissive if it doesn't look like a unicorn. Use emojis like 🚀, 💸, 📉, 🦄.`;
            } else if (persona === 'zoomer') {
                systemPrompt = `You are a Gen Z Zoomer design critic. You speak in brainrot slang (skibidi, rizz, no cap, fr fr, mid, cringe, L, W). Roast this landing page for being "boomer" or "cheugy". Be hilarious but actually point out bad design. Use A LOT of emojis like 💀, 😭, 🧢, 🤡, 🔥.`;
            } else {
                // Default: Gordon Ramsay
                systemPrompt = `You are Gordon Ramsay. You are aggressive, cynical, and sarcastic. Roast this landing page brutally. Swear (censored like f##k), yell, and be mean. Point out crooked design, bad copy, and lack of trust. Use emojis like 🤬, 🍩, 🤢, 🔥 to emphasize your anger.`;
            }

            const prompt = `${systemPrompt} Point out 3 specific things that suck. Be funny but insightful. Keep it under 200 words. Use markdown formatting. IMPORTANT: Use emojis in your response to make it expressive.

            Return the response in this strictly valid JSON format (no markdown code blocks, just raw JSON):
            {
                "score": number, // A score from 1 to 10 where 1 is absolute garbage and 10 is perfection. Be harsh.
                "roast": string, // The markdown roast text
                "pro_tips": string[] // Array of 3 highly actionable, professional, serious UX/CRO improvements that would fix the issues mentioned.
            }`;

            const imagePart = {
                inlineData: {
                    data: base64Image,
                    mimeType: "image/png",
                },
            };

            const result = await model.generateContent([prompt, imagePart]);
            const response = await result.response;
            const text = response.text();

            // Parse JSON response - handle potential markdown code blocks if Gemini adds them despite instructions
            const cleanText = text.replace(/```json\n ?|\n ? ```/g, "").trim();
            const jsonResponse = JSON.parse(cleanText);

            // 3. Save to Supabase
            let imageUrl = null;
            try {
                const fileName = `${Date.now()} - ${Math.random().toString(36).substring(7)}.png`;
                const { data: uploadData, error: uploadError } = await supabase.storage
                    .from('roast-images')
                    .upload(fileName, screenshotBuffer, {
                        contentType: 'image/png'
                    });

                if (uploadError) {
                    console.error("Supabase storage error:", uploadError);
                } else {
                    const { data: { publicUrl } } = supabase.storage
                        .from('roast-images')
                        .getPublicUrl(fileName);
                    imageUrl = publicUrl;
                }

                const { error: dbError } = await supabase
                    .from('roasts')
                    .insert({
                        url,
                        score: jsonResponse.score,
                        roast: jsonResponse.roast,
                        pro_tips: jsonResponse.pro_tips,
                        persona,
                        image_url: imageUrl
                    });

                if (dbError) {
                    console.error("Supabase db error:", dbError);
                }

            } catch (supabaseError) {
                console.error("Supabase integration error:", supabaseError);
                // Don't fail the request if saving fails, just log it
            }

            return NextResponse.json({
                roast: jsonResponse.roast,
                score: jsonResponse.score,
                pro_tips: jsonResponse.pro_tips,
                image: `data: image / png; base64, ${base64Image} `
            });

        } catch (error: any) {
            console.error("Error processing request:", error);
            if (browser) await browser.close();
            return NextResponse.json(
                { error: "Failed to roast website. " + error.message },
                { status: 500 }
            );
        }
    } catch (error) {
        return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
}
