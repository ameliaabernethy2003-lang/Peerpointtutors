// Import Supabase with error handling - using require to avoid build errors if package is missing
// eslint-disable-next-line @typescript-eslint/no-require-imports
let createClient: any = null;
try {
  const supabaseModule = require('@supabase/supabase-js');
  createClient = supabaseModule.createClient;
} catch {
  // Supabase package not available - app will use local JSON file storage
}

// Initialize Supabase client
// These will be set as environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Only create Supabase clients if credentials are provided AND package is available
let supabase: any = null;
let supabaseAdmin: any = null;

if (createClient && supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
  supabaseAdmin = createClient(
    supabaseUrl,
    process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey
  );
}
// No warning needed - app falls back to local JSON file storage automatically

export { supabase, supabaseAdmin };

