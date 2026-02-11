# Custom Domain Setup Guide

## Domains
- **Main Website**: P2Ptutors.com
- **Signup Form**: P2Ptutorsapplication.com

## For Local Development

### Option 1: Using Hosts File (Recommended)

1. **Edit your hosts file** (requires admin access):
   ```bash
   sudo nano /etc/hosts
   ```

2. **Add these lines**:
   ```
   127.0.0.1 P2Ptutors.com
   127.0.0.1 P2Ptutorsapplication.com
   ```

3. **Save and exit** (Ctrl+X, then Y, then Enter)

4. **Start the dev server**:
   ```bash
   npm run dev
   ```

5. **Access your sites**:
   - Main site: http://P2Ptutors.com:3000
   - Signup form: http://P2Ptutorsapplication.com:3000

### Option 2: Using Port 80 (Requires sudo)

1. **Edit your hosts file** (same as above)

2. **Run dev server on port 80**:
   ```bash
   sudo npm run dev -- -p 80
   ```

3. **Access your sites** (no port needed):
   - Main site: http://P2Ptutors.com
   - Signup form: http://P2Ptutorsapplication.com

## For Production Deployment

### Step 1: Deploy Your App
Deploy to your hosting provider (Vercel, Netlify, AWS, etc.)

### Step 2: Configure DNS
Point your domains to your server:

**For P2Ptutors.com:**
- A Record: `@` → Your server IP
- Or CNAME: `@` → Your hosting provider's domain

**For P2Ptutorsapplication.com:**
- A Record: `@` → Your server IP  
- Or CNAME: `@` → Your hosting provider's domain

### Step 3: Configure Hosting Provider
- Add both domains in your hosting provider's dashboard
- Enable SSL/HTTPS certificates (usually automatic)

### Step 4: Update Environment Variables (if needed)
If you need different configurations per domain, you can use:
- `NEXT_PUBLIC_MAIN_DOMAIN=P2Ptutors.com`
- `NEXT_PUBLIC_SIGNUP_DOMAIN=P2Ptutorsapplication.com`

## Quick Test

After setting up hosts file locally, test with:
```bash
ping P2Ptutors.com
# Should return: 127.0.0.1
```

## Troubleshooting

**Can't access domains locally:**
- Make sure hosts file was saved correctly
- Try flushing DNS: `sudo dscacheutil -flushcache` (Mac) or restart your computer
- Check that dev server is running on port 3000

**Port 80 requires sudo:**
- This is normal - port 80 requires admin privileges
- You can use port 3000 instead and access via `http://P2Ptutors.com:3000`

