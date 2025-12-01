import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function checkSchema() {
    const { data, error } = await supabase.from('roasts').select('*').limit(1);
    if (data && data.length) {
        console.log("Keys:", Object.keys(data[0]));
        console.log("Has created_at:", data[0].hasOwnProperty('created_at'));
        console.log("Value of created_at:", data[0].created_at);
    } else {
        console.log("No data found or error:", error);
    }
}
checkSchema();
