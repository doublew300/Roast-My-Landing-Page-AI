import { NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';
import { captureScreenshot } from "@/lib/screenshot";
import { generateRoast } from "@/lib/gemini";
import { RoastRequest } from "@/lib/types";

export const maxDuration = 90; // Allow longer timeout for screenshot + AI
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { url, persona = 'ramsay' } = body as RoastRequest;

        if (!url) {
            return NextResponse.json({ error: "URL is required" }, { status: 400 });
        }

        // 1. Capture Screenshot
        const screenshotBuffer = await captureScreenshot(url);
        const base64Image = screenshotBuffer.toString("base64");

        // 2. Generate Roast with Gemini
        const jsonResponse = await generateRoast(screenshotBuffer, persona);

        // 3. Save to Supabase (Fire and Forget / Non-blocking)
        const saveToSupabase = async () => {
            try {
                const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
                const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
                const supabase = createClient(supabaseUrl, supabaseAnonKey);

                let imageUrl = null;
                const fileName = `${Date.now()} - ${Math.random().toString(36).substring(7)}.png`;

                const { error: uploadError } = await supabase.storage
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
            }
        };

        // Execute Supabase saving without awaiting to speed up response
        saveToSupabase();

        return NextResponse.json({
            roast: jsonResponse.roast,
            score: jsonResponse.score,
            pro_tips: jsonResponse.pro_tips,
            image: `data:image/png;base64,${base64Image}`
        });

    } catch (error: any) {
        console.error("Error processing request:", error);
        return NextResponse.json(
            { error: error.message || "Failed to roast website." },
            { status: 500 }
        );
    }
}
