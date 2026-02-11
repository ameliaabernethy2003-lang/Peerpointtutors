# Google Calendar API Setup Checklist

## ✅ Step 1: Google Cloud Console (5 minutes)

- [ ] Go to: https://console.cloud.google.com/
- [ ] Sign in with your Google account
- [ ] Click project dropdown (top bar) → "New Project"
- [ ] Project name: `peerpoint-calendar` → Click "Create"
- [ ] Wait for project creation, then select it

## ✅ Step 2: Enable Google Calendar API (2 minutes)

- [ ] Click "APIs & Services" in left sidebar
- [ ] Click "Library"
- [ ] Search: `Google Calendar API`
- [ ] Click on "Google Calendar API"
- [ ] Click blue "ENABLE" button
- [ ] Wait for "API enabled" confirmation

## ✅ Step 3: Create Service Account (3 minutes)

- [ ] Click "APIs & Services" → "Credentials"
- [ ] Click "+ CREATE CREDENTIALS" (top blue button)
- [ ] Select "Service account"
- [ ] Fill in:
  - Service account name: `peerpoint-calendar-service`
  - Service account ID: (auto-filled, leave as is)
  - Description: `Service account for canceling calendar events`
- [ ] Click "CREATE AND CONTINUE"
- [ ] Skip "Grant access" → Click "CONTINUE"
- [ ] Skip "Grant users access" → Click "DONE"

## ✅ Step 4: Download JSON Key (2 minutes)

- [ ] Click on your service account email (in the list)
- [ ] Click "KEYS" tab at the top
- [ ] Click "ADD KEY" → "Create new key"
- [ ] Select "JSON" radio button
- [ ] Click "CREATE"
- [ ] **JSON file downloads automatically** - Note where it saved!

## ✅ Step 5: Format Credentials (I'll help with this!)

Once you have the JSON file, tell me the path and I'll format it, OR run:

```bash
npm run format-credentials <path-to-json-file>
```

Example:
```bash
npm run format-credentials ~/Downloads/peerpoint-calendar-service-abc123.json
```

## ✅ Step 6: Share Calendars (5 minutes per tutor)

For EACH tutor's calendar:

- [ ] Open Google Calendar (calendar.google.com)
- [ ] Click Settings (gear icon) → "Settings"
- [ ] Click "Settings for my calendars"
- [ ] Click on the calendar used for appointments
- [ ] Scroll to "Share with specific people"
- [ ] Click "Add people"
- [ ] Paste service account email (shown after Step 5)
- [ ] Select permission: "Make changes to events"
- [ ] Click "Send"

## ✅ Step 7: Test (2 minutes)

- [ ] Restart dev server: `npm run dev`
- [ ] Create a test booking
- [ ] Reject it from admin panel
- [ ] Verify calendar event was canceled ✅

---

**Current Status:** Ready for Step 1!

**Next:** Complete Steps 1-4, then share your JSON file path with me, and I'll format everything for you!
