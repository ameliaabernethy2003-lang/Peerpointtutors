# Database Setup Guide - Supabase

## Step 1: Create Supabase Account & Project

1. Go to https://supabase.com
2. Click "Start your project" or "Sign up"
3. Sign up with GitHub (recommended) or email
4. Click "New Project"
5. Fill in:
   - **Name**: PeerPointTutors (or your choice)
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Choose closest to you
   - **Pricing Plan**: Free (hobby) is fine to start
6. Click "Create new project"
7. Wait 2-3 minutes for project to be ready

## Step 2: Get Your API Keys

1. In your Supabase project dashboard, go to **Settings** → **API**
2. Copy these values:
   - **Project URL** (e.g., `https://abcdefghijklmnop.supabase.co`)
   - **anon/public key** (starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)
   - **service_role key** (starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`) - **Keep this secret!**

## Step 3: Create Database Tables

1. In Supabase dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy and paste the entire contents of `supabase-schema.sql`
4. Click **Run** (or press Cmd/Ctrl + Enter)
5. You should see "Success. No rows returned"

## Step 4: Set Up Environment Variables

1. Create a `.env.local` file in your project root:
   ```bash
   cd /Users/ameliaabernethy/Desktop/SGA/temp-next-app
   cp .env.example .env.local
   ```

2. Edit `.env.local` and add your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   ```

3. **Important**: Never commit `.env.local` to git (it's already in `.gitignore`)

## Step 5: Test the Connection

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Try submitting the tutor signup form
3. Check Supabase dashboard → **Table Editor** → `tutor_submissions` to see if data appears

## Step 6: Migrate Existing Data (Optional)

If you have existing data in the `submissions/` folder, you can migrate it:

1. The API routes will automatically use Supabase once configured
2. Old file-based data will remain in `submissions/` folder but won't be used
3. You can manually import old data if needed through Supabase dashboard

## Troubleshooting

### "Supabase environment variables are not set"
- Make sure `.env.local` exists and has correct values
- Restart your dev server after creating `.env.local`
- Check that variable names match exactly (no typos)

### "relation does not exist"
- Make sure you ran the SQL schema in Supabase SQL Editor
- Check that all tables were created successfully

### Connection errors
- Verify your Supabase project URL is correct
- Check that your API keys are correct
- Make sure your Supabase project is active (not paused)

## Next Steps

After database is set up:
1. Test the tutor signup form
2. Test accepting tutors in admin panel
3. Test payment flow
4. Deploy to Vercel (add environment variables in Vercel dashboard too)

