const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkEmojis() {
    const { data: roasts, error } = await supabase
        .from('roasts')
        .select('roast')
        .limit(5);

    if (error) {
        console.error("Error:", error);
        return;
    }

    console.log("Sample roasts:");
    roasts.forEach(r => console.log(r.roast.substring(0, 100) + "..."));
}

checkEmojis();
