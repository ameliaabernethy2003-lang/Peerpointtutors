# Google Calendar API Setup - Complete Guide

## 🎯 Goal
Set up a service account that can cancel calendar events for any tutor from the admin panel.

## 📋 Step-by-Step Instructions

### Step 1: Create Google Cloud Project (5 min)

1. Go to: **https://console.cloud.google.com/**
2. Sign in with your Google account
3. Click the **project dropdown** at the top (next to "Google Cloud")
4. Click **"New Project"**
5. Enter project name: `peerpoint-calendar` (or any name)
6. Click **"Create"**
7. Wait for project creation (10-30 seconds)
8. Select the new project from the dropdown

### Step 2: Enable Google Calendar API (2 min)

1. In the left sidebar, click **"APIs & Services"**
2. Click **"Library"**
3. In the search bar, type: `Google Calendar API`
4. Click on **"Google Calendar API"**
5. Click the blue **"ENABLE"** button
6. Wait for "API enabled" confirmation

### Step 3: Create Service Account (3 min)

1. In the left sidebar, click **"APIs & Services"** → **"Credentials"**
2. Click the blue **"+ CREATE CREDENTIALS"** button at the top
3. Select **"Service account"**
4. Fill in the form:
   - **Service account name**: `peerpoint-calendar-service`
   - **Service account ID**: (auto-filled, leave as is)
   - **Description**: `Service account for canceling calendar events`
5. Click **"CREATE AND CONTINUE"**
6. Skip "Grant this service account access to project" → Click **"CONTINUE"**
7. Skip "Grant users access to this service account" → Click **"DONE"**

### Step 4: Download JSON Key (2 min)

1. You should see your service account in the list
2. Click on the **service account email** (looks like: `peerpoint-calendar-service@your-project.iam.gserviceaccount.com`)
3. Click the **"KEYS"** tab at the top
4. Click **"ADD KEY"** → **"Create new key"**
5. Select **"JSON"** radio button
6. Click **"CREATE"**
7. **A JSON file will download automatically** - Note where it saved! (usually Downloads folder)

### Step 5: Format Credentials (I'll help!)

Once you have the JSON file, run this command:

```bash
npm run format-credentials <path-to-json-file>
```

**Example:**
```bash
npm run format-credentials ~/Downloads/peerpoint-calendar-service-abc123.json
```

Or just tell me the path and I'll run it for you!

### Step 6: Share Calendars (5 min per tutor)

For **EACH** tutor's Google Calendar:

1. Open **Google Calendar** (calendar.google.com)
2. Click **Settings** (gear icon) → **"Settings"**
3. Click **"Settings for my calendars"**
4. Click on the **calendar used for appointments**
5. Scroll down to **"Share with specific people"**
6. Click **"Add people"**
7. Paste the **service account email** (you'll see this after Step 5)
8. Select permission: **"Make changes to events"**
9. Click **"Send"**

**Repeat for each tutor's calendar.**

### Step 7: Test (2 min)

1. Restart your dev server: `npm run dev`
2. Create a test booking
3. Reject it from admin panel
4. Verify calendar event was canceled ✅

---

## 🆘 Need Help?

- If you get stuck on any step, let me know!
- Once you have the JSON file, share the path and I'll format everything
- Run `npm run validate-calendar` to check your setup

---

## 📝 Quick Reference

**Service Account Email Format:**
`peerpoint-calendar-service@your-project-id.iam.gserviceaccount.com`

**Required Permission:**
"Make changes to events"

**What This Enables:**
- Admin can cancel appointments for any tutor
- Automatic calendar event cancellation when rejecting bookings
- No manual calendar management needed
