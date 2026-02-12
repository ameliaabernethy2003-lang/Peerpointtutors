// Import Supabase with error handling - using require to avoid build errors if package is missing
// eslint-disable-next-line @typescript-eslint/no-require-imports
let createClient: any = null;
try {
  const supabaseModule = require('@supabase/supabase-js');
  createClient = supabaseModule.createClient;
} catch (e) {
  console.warn('Supabase package not available:', e);
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
} else {
  if (!createClient) {
    console.warn('Supabase package not installed. Database features will not work.');
  } else {
    console.warn('Supabase environment variables are not set. Database features will not work.');
  }
}

export { supabase, supabaseAdmin };

