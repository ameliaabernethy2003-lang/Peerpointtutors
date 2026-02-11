# Quick Start: Google Calendar API Setup

## 🚀 Automated Setup (Easiest)

Run this command and follow the prompts:

```bash
npm run setup-calendar
```

This interactive script will:
1. Guide you through Google Cloud Console steps
2. Extract credentials from your JSON file
3. Create `.env.local` automatically
4. Validate your setup

## 📋 Manual Setup

If you prefer manual setup, follow these steps:

### 1. Run the Setup Script

```bash
# Option A: Interactive Node.js script (recommended)
npm run setup-calendar

# Option B: Bash script
./scripts/setup-calendar-api.sh
```

### 2. Complete Google Cloud Steps

The script will guide you through:
- Creating a Google Cloud project
- Enabling Google Calendar API
- Creating a service account
- Downloading the JSON key file

### 3. Share Calendars

For each tutor's calendar:
- Share with the service account email
- Grant "Make changes to events" permission

### 4. Validate

```bash
npm run validate-calendar
```

## ✅ Done!

Once setup is complete:
1. Restart your dev server: `npm run dev`
2. Test by rejecting a booking from admin panel
3. Verify calendar events are canceled

## 🆘 Need Help?

See `GOOGLE_CALENDAR_SETUP.md` for detailed instructions.
