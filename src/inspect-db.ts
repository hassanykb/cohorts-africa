import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { createClient } from "@supabase/supabase-js";

async function inspectSimple() {
    console.log("Starting DB inspection...");
    try {
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
        
        if (!url || !key) {
            console.error("Missing SUPABASE_URL or SERVICE_ROLE_KEY");
            return;
        }

        const supabase = createClient(url, key);
        const { data, error } = await supabase.from('User').select('*').limit(1);
        if (error) {
            console.error("Select Error:", error);
        } else if (data && data.length > 0) {
            console.log("Available Columns:", Object.keys(data[0]));
            // console.log("Sample Data:", data[0]);
        } else {
            console.log("No data found in User table to inspect columns.");
        }
    } catch (e) {
        console.error("Runtime Error during inspection:", e);
    }
}
inspectSimple();
