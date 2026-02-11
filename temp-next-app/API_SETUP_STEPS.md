# Google Calendar API Setup - Step by Step

Follow these steps in order. I'll help you format everything once you have the credentials.

## Step 1: Create Google Cloud Project

1. Go to: https://console.cloud.google.com/
2. Click the project dropdown at the top
3. Click "New Project"
4. Enter project name: `peerpoint-calendar` (or any name you prefer)
5. Click "Create"
6. Wait for project to be created, then select it

## Step 2: Enable Google Calendar API

1. In the left sidebar, click "APIs & Services" > "Library"
2. In the search bar, type: `Google Calendar API`
3. Click on "Google Calendar API"
4. Click the blue "Enable" button
5. Wait for it to enable (takes a few seconds)

## Step 3: Create Service Account

1. Go to "APIs & Services" > "Credentials" (in left sidebar)
2. Click the blue "+ CREATE CREDENTIALS" button at the top
3. Select "Service account"
4. Fill in:
   - **Service account name**: `peerpoint-calendar-service`
   - **Service account ID**: (auto-filled, leave as is)
   - **Description**: `Service account for canceling calendar events`
5. Click "CREATE AND CONTINUE"
6. Skip "Grant this service account access to project" (click "CONTINUE")
7. Skip "Grant users access to this service account" (click "DONE")

## Step 4: Generate Service Account Key

1. You should now see your service account in the list
2. Click on the service account email (it will be something like `peerpoint-calendar-service@your-project.iam.gserviceaccount.com`)
3. Click the "KEYS" tab at the top
4. Click "ADD KEY" > "Create new key"
5. Select "JSON" format
6. Click "CREATE"
7. **A JSON file will download automatically** - save this file somewhere safe!

## Step 5: Extract Credentials

Once you have the JSON file, I'll help you:
1. Extract the service account email
2. Format the private key correctly
3. Create your `.env.local` file

**Just share the JSON file path or its contents, and I'll format everything for you!**

## Step 6: Share Calendars

For EACH tutor's Google Calendar:

1. Open Google Calendar (calendar.google.com)
2. On the left sidebar, find "Settings" (gear icon) > "Settings"
3. Click "Settings for my calendars"
4. Click on the calendar used for appointments
5. Scroll down to "Share with specific people"
6. Click "Add people"
7. Paste the service account email (from Step 4)
8. Select permission: "Make changes to events"
9. Click "Send"

Repeat for each tutor's calendar.

## Step 7: Test

1. Restart your dev server
2. Create a test booking
3. Reject it from admin panel
4. Verify the calendar event was canceled

---

**Ready? Start with Step 1 and let me know when you have the JSON file!**
