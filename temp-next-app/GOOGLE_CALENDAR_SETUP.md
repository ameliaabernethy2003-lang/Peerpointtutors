# Google Calendar API Setup

To enable automatic calendar event cancellation when bookings are rejected, you need to set up Google Calendar API credentials.

## Steps to Set Up Google Calendar API

### 1. Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Calendar API:
   - Navigate to "APIs & Services" > "Library"
   - Search for "Google Calendar API"
   - Click "Enable"

### 2. Create a Service Account

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "Service Account"
3. Fill in the service account details:
   - Name: `peerpoint-calendar-service`
   - Description: `Service account for canceling calendar events`
4. Click "Create and Continue"
5. Skip the optional steps and click "Done"

### 3. Generate Service Account Key

1. Click on the service account you just created
2. Go to the "Keys" tab
3. Click "Add Key" > "Create new key"
4. Select "JSON" format
5. Download the JSON file (keep it secure!)

### 4. Share Calendar with Service Account

1. Open the JSON file you downloaded
2. Copy the `client_email` value (e.g., `peerpoint-calendar-service@your-project.iam.gserviceaccount.com`)
3. For each tutor's Google Calendar:
   - Open Google Calendar
   - Go to Settings > "Settings for my calendars"
   - Select the calendar used for appointments
   - Click "Share with specific people"
   - Add the service account email
   - Give it "Make changes to events" permission
   - Click "Send"

### 5. Set Environment Variables

Add these to your `.env.local` file:

```env
GOOGLE_SERVICE_ACCOUNT_EMAIL=peerpoint-calendar-service@your-project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----\n"
```

**Important Notes:**
- The private key should be the entire key from the JSON file, including the `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----` lines
- Keep the newlines (`\n`) in the private key
- Never commit the `.env.local` file to version control

### 6. Alternative: Use OAuth 2.0 (More Complex)

If you prefer OAuth 2.0 instead of service accounts, you'll need to:
1. Create OAuth 2.0 credentials
2. Implement the OAuth flow
3. Store and refresh access tokens

Service accounts are recommended for server-to-server communication.

## Testing

After setup, test the integration:
1. Create a booking
2. Verify the booking (if needed)
3. Reject the booking from the admin panel
4. Check that the calendar event was canceled

## Troubleshooting

### "Permission denied" error
- Make sure you've shared the calendar with the service account email
- Verify the service account has "Make changes to events" permission

### "Calendar not found" error
- Verify the booking URL format is correct
- Check that the calendar ID extraction is working

### Events not being found
- The system searches for events matching the booking ID or tutor name
- Make sure events are created with identifiable information
- Events are searched within the last 7 days and next 30 days

## Security Notes

- Never expose your service account credentials
- Use environment variables for all sensitive data
- Rotate keys periodically
- Monitor API usage in Google Cloud Console
