# Google Calendar API Setup - Quick Instructions

## 🚀 Fastest Way to Set Up

### Step 1: Get Your JSON File

1. Go to: https://console.cloud.google.com/
2. Create a project (or select existing)
3. Enable Google Calendar API:
   - APIs & Services > Library > Search "Google Calendar API" > Enable
4. Create Service Account:
   - APIs & Services > Credentials > Create Credentials > Service Account
   - Name: `peerpoint-calendar-service`
   - Click: Create and Continue > Done
5. Download JSON Key:
   - Click on the service account
   - Keys tab > Add Key > Create new key > JSON > Create
   - **Save the downloaded JSON file**

### Step 2: Format Credentials (I'll do this for you!)

Once you have the JSON file, run:

```bash
npm run format-credentials <path-to-json-file>
```

**Example:**
```bash
npm run format-credentials ~/Downloads/peerpoint-calendar-service-abc123.json
```

This will automatically:
- ✅ Extract your credentials
- ✅ Format them correctly
- ✅ Create `.env.local` file
- ✅ Validate the setup

### Step 3: Share Calendars

For **EACH** tutor's Google Calendar:

1. Open Google Calendar
2. Settings > Settings for my calendars
3. Click on the calendar used for appointments
4. Scroll to "Share with specific people"
5. Click "Add people"
6. Paste the service account email (shown after Step 2)
7. Select permission: **"Make changes to events"**
8. Click "Send"

### Step 4: Test

1. Restart dev server: `npm run dev`
2. Create a test booking
3. Reject it from admin panel
4. Verify calendar event was canceled ✅

---

## Alternative: Interactive Setup

If you prefer step-by-step guidance:

```bash
npm run setup-calendar
```

This will guide you through everything interactively.

---

## Need Help?

- See `GOOGLE_CALENDAR_SETUP.md` for detailed instructions
- See `API_SETUP_STEPS.md` for step-by-step guide
- Run `npm run validate-calendar` to check your setup
