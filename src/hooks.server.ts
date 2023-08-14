import { PUBLIC_SUPABASE_EMAIL, PUBLIC_SUPABASE_KEY, PUBLIC_SUPABASE_PASSWORD } from "$env/static/public";
import { createClient } from '@supabase/supabase-js';

// Define Supabase URL, API key, and initialize a Supabase client
const supabaseUrl = 'https://hobixloqfrxsnqlwfqer.supabase.co';
const supabaseKey: any = PUBLIC_SUPABASE_KEY;
export const supabase = createClient(supabaseUrl, supabaseKey);

// Login to Supabase using provided email and password
try {
    if (PUBLIC_SUPABASE_EMAIL && PUBLIC_SUPABASE_PASSWORD) {
        await supabase.auth.signInWithPassword({
            email: PUBLIC_SUPABASE_EMAIL.toString(),
            password: PUBLIC_SUPABASE_PASSWORD.toString()
        });
    }
} catch (error) {
    console.log('error during login');
    console.log(error);
}