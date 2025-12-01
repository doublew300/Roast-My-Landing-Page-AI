import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testVote() {
    console.log("1. Fetching a roast to get an ID...");
    const { data: roasts, error } = await supabase
        .from('roasts')
        .select('id, url, votes')
        .limit(1);

    if (error || !roasts || roasts.length === 0) {
        console.error("❌ Failed to fetch roasts:", error);
        return;
    }

    const roast = roasts[0];
    console.log(`   Found roast: ${roast.url} (ID: ${roast.id}) - Current Votes: ${roast.votes}`);

    console.log("\n2. Calling /api/vote endpoint...");
    try {
        const response = await fetch('http://localhost:3000/api/vote', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: roast.id })
        });

        const result = await response.json();
        console.log("   API Response:", response.status, result);

        if (response.ok) {
            console.log("✅ API call successful.");
        } else {
            console.error("❌ API call failed.");
        }
    } catch (err) {
        console.error("❌ Network error calling API:", err.message);
    }

    console.log("\n3. Verifying if votes increased...");
    const { data: updatedRoast } = await supabase
        .from('roasts')
        .select('votes')
        .eq('id', roast.id)
        .single();

    console.log(`   Old Votes: ${roast.votes} -> New Votes: ${updatedRoast?.votes}`);
    if (updatedRoast?.votes > roast.votes) {
        console.log("✅ SUCCESS: Vote persisted!");
    } else {
        console.log("❌ FAILURE: Vote did not persist.");
    }
}

testVote();
