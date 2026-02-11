# Troubleshooting: "Manual Cancellation Required"

If you're seeing "manual cancellation required" instead of automatic cancellation, check these:

## ✅ Step 1: Restart Dev Server

**IMPORTANT:** After creating `.env.local`, you MUST restart your dev server!

1. Stop your current dev server (Ctrl+C or Cmd+C)
2. Start it again: `npm run dev`
3. The server needs to reload to read the new environment variables

## ✅ Step 2: Share Calendars

The service account needs access to each tutor's calendar:

**Service Account Email:**
```
peerpoint-calender-service@robust-window-486522-h1.iam.gserviceaccount.com
```

**For each tutor:**
1. Open Google Calendar
2. Settings → Settings for my calendars
3. Click on the appointment calendar
4. Share with: `peerpoint-calender-service@robust-window-486522-h1.iam.gserviceaccount.com`
5. Permission: **"Make changes to events"**

## ✅ Step 3: Check Server Logs

When you reject a booking, check your terminal/console for error messages. You should see:
- "Attempting to cancel calendar event for booking: [ID]"
- "Calendar cancellation result: [success/failure]"

Common errors:
- **403 Forbidden**: Calendar not shared with service account
- **404 Not Found**: Calendar ID not found or incorrect
- **401 Unauthorized**: Credentials issue

## ✅ Step 4: Verify Setup

Run this to check your setup:
```bash
npm run validate-calendar
```

Should show:
- ✅ Environment variables found
- ✅ Google Calendar client initialized successfully

## 🔍 Debug Steps

1. **Check .env.local exists:**
   ```bash
   cat .env.local
   ```
   Should show your credentials

2. **Check if server is reading env vars:**
   Look for console logs when rejecting a booking

3. **Test calendar access:**
   Try accessing the calendar manually with the service account email

## 🆘 Still Not Working?

Share the error message from your server logs and I'll help debug!
