# Google Calendar OAuth2 Setup Guide

This guide explains how to set up Google Calendar API access using OAuth2 for `peerpointtutors@gmail.com`. This allows the admin to automatically cancel calendar events when bookings are rejected.

## Overview

Instead of using a service account, we're using OAuth2 authentication with `peerpointtutors@gmail.com`. Tutors will share their calendars with this email address, and the system will use OAuth2 credentials to access and cancel events programmatically.

## Prerequisites

- A Google account: `peerpointtutors@gmail.com`
- Access to Google Cloud Console
- Node.js and npm installed

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the project dropdown at the top
3. Click **"New Project"**
4. Enter a project name (e.g., "PeerPoint Tutors")
5. Click **"Create"**

## Step 2: Enable Google Calendar API

1. In the Google Cloud Console, go to **"APIs & Services"** → **"Library"**
2. Search for **"Google Calendar API"**
3. Click on it and click **"Enable"**

## Step 3: Create OAuth2 Credentials

1. Go to **"APIs & Services"** → **"Credentials"**
2. Click **"+ CREATE CREDENTIALS"** → **"OAuth client ID"**
3. If prompted, configure the OAuth consent screen:
   - Choose **"External"** (unless you have a Google Workspace account)
   - Fill in the required fields:
     - App name: "PeerPoint Tutors"
     - User support email: `peerpointtutors@gmail.com`
     - Developer contact: `peerpointtutors@gmail.com`
   - Click **"Save and Continue"**
   - Add scopes: `https://www.googleapis.com/auth/calendar`
   - Click **"Save and Continue"**
   - Add test users (if needed): `peerpointtutors@gmail.com`
   - Click **"Save and Continue"**
   - Click **"Back to Dashboard"**

4. Create OAuth Client ID:
   - Application type: **"Web application"**
   - Name: "PeerPoint Tutors Calendar"
   - Authorized redirect URIs: `http://localhost:3000/api/auth/callback`
   - Click **"Create"**
   - **Copy the Client ID and Client Secret** (you'll need these)

## Step 4: Get Refresh Token

You need to obtain a refresh token for `peerpointtutors@gmail.com`. Here's how:

### Option A: Using Google OAuth Playground (Easier)

1. Go to [Google OAuth Playground](https://developers.google.com/oauthplayground/)
2. Click the gear icon (⚙️) in the top right
3. Check **"Use your own OAuth credentials"**
4. Enter your **Client ID** and **Client Secret** from Step 3
5. In the left panel, find **"Calendar API v3"** and select:
   - `https://www.googleapis.com/auth/calendar`
6. Click **"Authorize APIs"**
7. Sign in with `peerpointtutors@gmail.com`
8. Click **"Allow"**
9. Click **"Exchange authorization code for tokens"**
10. **Copy the "Refresh token"** (you'll need this)

### Option B: Using a Node.js Script

Create a file `get-refresh-token.js`:

```javascript
const { google } = require('googleapis');
const readline = require('readline');

const CLIENT_ID = 'YOUR_CLIENT_ID';
const CLIENT_SECRET = 'YOUR_CLIENT_SECRET';
const REDIRECT_URI = 'http://localhost:3000/api/auth/callback';

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

const scopes = ['https://www.googleapis.com/auth/calendar'];

const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: scopes,
});

console.log('Authorize this app by visiting this url:', authUrl);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question('Enter the code from that page here: ', (code) => {
  rl.close();
  oauth2Client.getToken(code, (err, token) => {
    if (err) return console.error('Error retrieving access token', err);
    console.log('Refresh Token:', token.refresh_token);
    console.log('\nAdd these to your .env.local file:');
    console.log(`GOOGLE_CLIENT_ID=${CLIENT_ID}`);
    console.log(`GOOGLE_CLIENT_SECRET=${CLIENT_SECRET}`);
    console.log(`GOOGLE_REFRESH_TOKEN=${token.refresh_token}`);
    console.log(`GOOGLE_REDIRECT_URI=${REDIRECT_URI}`);
  });
});
```

Run it:
```bash
node get-refresh-token.js
```

Follow the instructions to get your refresh token.

## Step 5: Configure Environment Variables

Create or update `.env.local` in your project root:

```env
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
GOOGLE_REFRESH_TOKEN=your_refresh_token_here
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/callback
```

## Step 6: Share Calendars with peerpointtutors@gmail.com

Each tutor must share their Google Calendar with `peerpointtutors@gmail.com`:

1. Open [Google Calendar](https://calendar.google.com)
2. Click **Settings** (gear icon) → **Settings**
3. Click **"Settings for my calendars"**
4. Click on the calendar used for appointments
5. Scroll to **"Share with specific people"**
6. Click **"Add people"**
7. Enter: `peerpointtutors@gmail.com`
8. Select permission: **"Make changes to events"**
9. Click **"Send"**

## Step 7: Test the Setup

1. Restart your development server:
   ```bash
   npm run dev
   ```

2. Try rejecting a booking in the admin panel
3. Check the server logs for any errors
4. Verify that the calendar event is canceled

## Troubleshooting

### "Permission denied" errors
- Make sure the tutor's calendar is shared with `peerpointtutors@gmail.com`
- Verify the permission is set to "Make changes to events"

### "Invalid refresh token" errors
- The refresh token may have expired or been revoked
- Generate a new refresh token using Step 4

### "Calendar not found" errors
- Verify the calendar is shared correctly
- Check that you're using the correct calendar ID

## Notes

- The refresh token doesn't expire unless revoked
- Keep your credentials secure and never commit them to version control
- The `.env.local` file is already in `.gitignore` and won't be committed
