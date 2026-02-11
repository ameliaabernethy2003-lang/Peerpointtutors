# Deployment Instructions

## Deploy to Vercel (Recommended - Free & Permanent)

### Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

### Step 2: Login to Vercel
```bash
vercel login
```

### Step 3: Deploy
```bash
cd /Users/ameliaabernethy/Desktop/SGA/temp-next-app
vercel
```

Follow the prompts:
- Set up and deploy? **Yes**
- Which scope? (select your account)
- Link to existing project? **No**
- Project name? (press enter for default or choose a name)
- Directory? (press enter for `./`)
- Override settings? **No**

### Step 4: Get Your Public URL
After deployment, Vercel will give you a URL like:
- `https://your-project-name.vercel.app`

### Step 5: Share the Form Link
Your tutor signup form will be accessible at:
- `https://your-project-name.vercel.app/tutor-signup`

### Step 6: Update Environment Variables (if needed)
If you have any environment variables, add them in Vercel dashboard:
1. Go to your project on vercel.com
2. Settings → Environment Variables
3. Add any needed variables

### Step 7: Future Updates
To deploy updates:
```bash
vercel --prod
```

---

## Alternative: Quick Tunnel with ngrok (Temporary)

### Step 1: Install ngrok
Download from: https://ngrok.com/download
Or if you have Homebrew:
```bash
brew install ngrok/ngrok/ngrok
```

### Step 2: Sign up for free account
Go to: https://dashboard.ngrok.com/signup

### Step 3: Get your authtoken
After signing up, copy your authtoken from the dashboard

### Step 4: Configure ngrok
```bash
ngrok config add-authtoken YOUR_AUTHTOKEN_HERE
```

### Step 5: Start your app
```bash
cd /Users/ameliaabernethy/Desktop/SGA/temp-next-app
npm run dev
```

### Step 6: Create tunnel (in new terminal)
```bash
ngrok http 3000
```

### Step 7: Share the URL
ngrok will give you a URL like: `https://abc123.ngrok.io`
Your form will be at: `https://abc123.ngrok.io/tutor-signup`

**Note:** The ngrok URL changes each time you restart it (unless you have a paid plan).

