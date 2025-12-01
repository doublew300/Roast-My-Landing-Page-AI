require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log("URL:", supabaseUrl);
console.log("Key exists:", !!supabaseAnonKey);

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
    console.log("Testing connection...");
    const { data, error } = await supabase.from('roasts').select('*').limit(5);
    if (error) {
        console.error("Error:", error);
    } else {
        console.log("Success! Data count:", data.length);
        console.log("First item:", data[0]);
    }
}

test();
