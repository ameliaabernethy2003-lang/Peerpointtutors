# Google Calendar API Setup Checklist

Follow these steps in order:

## ✅ Step 1: Google Cloud Console Setup
- [ ] Go to https://console.cloud.google.com/
- [ ] Create new project (or select existing)
- [ ] Enable Google Calendar API
  - Navigate to: APIs & Services > Library
  - Search: "Google Calendar API"
  - Click: Enable

## ✅ Step 2: Create Service Account
- [ ] Go to: APIs & Services > Credentials
- [ ] Click: Create Credentials > Service Account
- [ ] Name: `peerpoint-calendar-service`
- [ ] Description: `Service account for canceling calendar events`
- [ ] Click: Create and Continue
- [ ] Skip optional steps, click: Done

## ✅ Step 3: Generate Key
- [ ] Click on the service account you created
- [ ] Go to: Keys tab
- [ ] Click: Add Key > Create new key
- [ ] Select: JSON format
- [ ] Download the JSON file (keep it secure!)

## ✅ Step 4: Extract Credentials
Open the downloaded JSON file and find:
- `client_email` - This is your GOOGLE_SERVICE_ACCOUNT_EMAIL
- `private_key` - This is your GOOGLE_PRIVATE_KEY

## ✅ Step 5: Share Calendars
For EACH tutor's Google Calendar:
- [ ] Open Google Calendar
- [ ] Go to: Settings > Settings for my calendars
- [ ] Select the calendar used for appointments
- [ ] Click: Share with specific people
- [ ] Add the service account email (from Step 4)
- [ ] Permission: "Make changes to events"
- [ ] Click: Send

## ✅ Step 6: Set Environment Variables
Create `.env.local` file in project root with:
```env
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...your key...\n-----END PRIVATE KEY-----\n"
```

## ✅ Step 7: Test
- [ ] Restart your dev server
- [ ] Create a test booking
- [ ] Reject the booking from admin panel
- [ ] Verify calendar event was canceled

---

**Need Help?** See GOOGLE_CALENDAR_SETUP.md for detailed instructions.
