const SUPABASE_URL =
    "https://actlzyfblgmhytgyjhzf.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_9GJxgJuQ6oEWz4VwXGqwgg_mmbGN0_G";

const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );

window.supabaseClient = supabaseClient;