const { createClient } = require('@supabase/supabase-js');
const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config({ path: '.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const googleApiKey = process.env.GOOGLE_API_KEY;

if (!supabaseUrl || !supabaseAnonKey || !googleApiKey) {
    console.error("Missing environment variables");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);
const genAI = new GoogleGenerativeAI(googleApiKey);
const model = genAI.getGenerativeModel({ model: "gemini-3-pro-preview" });

async function emojifyRoasts() {
    console.log("Fetching roasts...");
    const { data: roasts, error } = await supabase
        .from('roasts')
        .select('id, roast, persona')
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error fetching roasts:", error);
        return;
    }

    console.log(`Found ${roasts.length} roasts. Starting emojification...`);

    for (const roast of roasts) {
        // Skip if already has emojis (simple check)
        // Actually, let's just re-process all to be safe and consistent, 
        // unless it clearly has a lot of emojis. 
        // But for 27 items, just doing all is fine.

        console.log(`Processing roast ${roast.id}...`);

        try {
            const prompt = `Rewrite the following roast text to include relevant and expressive emojis. Keep the tone consistent with the persona '${roast.persona || 'ramsay'}'. Do not change the meaning, just add emojis. Return ONLY the text with emojis.

            Original Text:
            "${roast.roast}"`;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const newRoast = response.text().trim();

            if (newRoast) {
                const { error: updateError } = await supabase
                    .from('roasts')
                    .update({ roast: newRoast })
                    .eq('id', roast.id);

                if (updateError) {
                    console.error(`Failed to update roast ${roast.id}:`, updateError);
                } else {
                    console.log(`Updated roast ${roast.id} with emojis.`);
                }
            }

            // Avoid rate limits
            await new Promise(resolve => setTimeout(resolve, 1000));

        } catch (err) {
            console.error(`Failed to process roast ${roast.id}:`, err);
        }
    }

    console.log("Done!");
}

emojifyRoasts();
