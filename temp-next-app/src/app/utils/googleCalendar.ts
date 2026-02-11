// Import googleapis with error handling - using require to avoid TypeScript build errors
// eslint-disable-next-line @typescript-eslint/no-require-imports
let google: any;
try {
  google = require('googleapis').google;
} catch {
  google = null;
}

/**
 * Initialize Google Calendar API client using OAuth2 for peerpointtutors@gmail.com
 * Requires GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_REFRESH_TOKEN environment variables
 * Tutors should share their calendars with peerpointtutors@gmail.com
 */
export function getCalendarClient() {
  if (!google) {
    console.warn('❌ googleapis module not available');
    return null;
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/auth/callback';

  // Debug logging
  console.log('🔍 Google Calendar Client Check (OAuth2):');
  console.log('  Client ID:', clientId ? '✅ Found' : '❌ Missing');
  console.log('  Client Secret:', clientSecret ? '✅ Found' : '❌ Missing');
  console.log('  Refresh Token:', refreshToken ? '✅ Found' : '❌ Missing');

  if (!clientId || !clientSecret || !refreshToken) {
    console.error('❌ Google Calendar API not configured. Missing:', {
      clientId: !clientId,
      clientSecret: !clientSecret,
      refreshToken: !refreshToken,
    });
    return null;
  }

  try {
    const oauth2Client = new google.auth.OAuth2(
      clientId,
      clientSecret,
      redirectUri
    );

    // Set the refresh token and ensure it refreshes automatically
    oauth2Client.setCredentials({
      refresh_token: refreshToken,
    });

    // Ensure tokens are refreshed automatically
    oauth2Client.on('tokens', (tokens: any) => {
      if (tokens.refresh_token) {
        console.log('🔄 New refresh token received');
      }
      if (tokens.access_token) {
        console.log('✅ Access token refreshed');
      }
    });

    return google.calendar({ version: 'v3', auth: oauth2Client });
  } catch (error) {
    console.error('Error initializing Google Calendar client:', error);
    return null;
  }
}

/**
 * Extract calendar ID from Google Calendar appointment schedule URL
 * Handles multiple URL formats including shortened URLs
 */
export function extractCalendarId(bookingUrl: string): string | null {
  try {
    console.log('🔍 Extracting calendar ID from URL:', bookingUrl);
    
    // Format 1: Full appointment schedule URL
    // https://calendar.google.com/calendar/appointments/schedules/{calendarId}
    // or: https://calendar.google.com/calendar/u/0/appointments/schedules/{calendarId}
    let match = bookingUrl.match(/\/appointments\/schedules\/([a-zA-Z0-9_-]+)/);
    if (match) {
      console.log('✅ Found calendar ID (format 1):', match[1]);
      return match[1];
    }
    
    // Format 2: Shortened URL - calendar.app.google/{shortId}
    // These need to be resolved, but we can try to use the short ID directly
    // Note: This might not work, but we'll try
    match = bookingUrl.match(/calendar\.app\.google\/([a-zA-Z0-9_-]+)/);
    if (match) {
      console.log('⚠️  Found shortened URL format. Calendar ID extraction may not work directly.');
      // For shortened URLs, we'll need to list calendars and search
      return null; // Return null to trigger calendar listing approach
    }
    
    // Format 3: Try to extract any ID-like pattern
    match = bookingUrl.match(/\/([a-zA-Z0-9_-]{10,})/);
    if (match) {
      console.log('⚠️  Attempting to use extracted ID:', match[1]);
      return match[1];
    }
    
    console.log('❌ Could not extract calendar ID from URL');
    return null;
  } catch (error) {
    console.error('Error extracting calendar ID:', error);
    return null;
  }
}

/**
 * List all calendars accessible to peerpointtutors@gmail.com
 */
async function listCalendars(calendar: any): Promise<string[]> {
  try {
    console.log('📋 Listing all accessible calendars...');
    const response = await calendar.calendarList.list();
    const calendars = response.data.items || [];
    const calendarIds = calendars.map((cal: any) => ({
      id: cal.id,
      summary: cal.summary,
      accessRole: cal.accessRole,
    }));
    
    console.log(`✅ Found ${calendarIds.length} calendars:`);
    calendarIds.forEach((cal: any) => {
      console.log(`   - ${cal.summary || cal.id} (${cal.accessRole})`);
    });
    
    return calendarIds.map((cal: any) => cal.id).filter(Boolean);
  } catch (error: any) {
    console.error('❌ Error listing calendars:', error.message);
    console.error('   Error code:', error.code);
    if (error.response?.data) {
      console.error('   Error details:', JSON.stringify(error.response.data, null, 2));
    }
    return [];
  }
}

/**
 * Find and cancel a calendar event for a booking
 * This searches for events matching the booking details and cancels them
 */
export async function cancelCalendarEvent(
  bookingUrl: string,
  tutorName: string,
  bookingId: string
): Promise<{ success: boolean; message: string; canceledEventId?: string }> {
  const calendar = getCalendarClient();
  
  if (!calendar) {
    return {
      success: false,
      message: 'Google Calendar API not configured. Please set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_REFRESH_TOKEN environment variables. Make sure tutors share their calendars with peerpointtutors@gmail.com.',
    };
  }

  try {
    // Always list all calendars to search through them
    // This is more reliable than trying to extract calendar ID from URL
    console.log('📋 Listing all accessible calendars to search for events...');
    const allCalendarIds = await listCalendars(calendar);
    
    if (allCalendarIds.length === 0) {
      return {
        success: false,
        message: 'No accessible calendars found. Make sure tutors share their calendars with peerpointtutors@gmail.com and grant "Make changes to events" permission.',
      };
    }
    
    const calendarIdsToSearch = allCalendarIds;
    console.log(`✅ Will search through ${calendarIdsToSearch.length} calendar(s)`);

    // Search for events in the calendar(s) that match the booking
    // Expand search window to catch all possible events
    const now = new Date();
    const timeMin = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); // Last 30 days
    const timeMax = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000); // Next 90 days

    // Normalize search terms - be flexible with matching
    const normalizedTutorName = tutorName.toLowerCase().trim();
    const normalizedBookingId = bookingId.toLowerCase();
    
    // Extract first and last name parts for more flexible matching
    const nameParts = normalizedTutorName.split(' ').filter(p => p.length > 0);
    const firstName = nameParts[0] || '';
    const lastName = nameParts[nameParts.length - 1] || '';
    
    console.log('🔍 Searching for events matching:');
    console.log('   Tutor Name:', normalizedTutorName);
    console.log('   First Name:', firstName);
    console.log('   Last Name:', lastName);
    console.log('   Booking ID:', normalizedBookingId);
    console.log('   Time Range:', timeMin.toISOString(), 'to', timeMax.toISOString());
    console.log('   Searching in', calendarIdsToSearch.length, 'calendar(s)');

    // Search each calendar
    for (const calId of calendarIdsToSearch) {
      try {
        console.log(`🔎 Searching calendar: ${calId.substring(0, 20)}...`);
        
        const response = await calendar.events.list({
          calendarId: calId,
          timeMin: timeMin.toISOString(),
          timeMax: timeMax.toISOString(),
          maxResults: 100, // Increased to find more events
          singleEvents: true,
          orderBy: 'startTime',
        });

        const events = response.data.items || [];
        console.log(`   Found ${events.length} events in this calendar`);

        // Log first few events for debugging
        if (events.length > 0) {
          console.log(`   Sample events:`);
          events.slice(0, 3).forEach((event: any, idx: number) => {
            console.log(`     ${idx + 1}. "${event.summary}" (${event.start?.dateTime || event.start?.date})`);
          });
        }

        // Try to find event matching the booking
        // Look for events with booking ID or tutor name in description/summary/attendees
        const matchingEvent = events.find((event) => {
          const summary = (event.summary || '').toLowerCase();
          const description = (event.description || '').toLowerCase();
          const location = (event.location || '').toLowerCase();
          const organizerEmail = (event.organizer?.email || '').toLowerCase();
          const attendees = (event.attendees || []).map((a: any) => 
            (a.email || '').toLowerCase() + ' ' + (a.displayName || '').toLowerCase()
          ).join(' ');
          
          // Check multiple fields for matches
          const allText = `${summary} ${description} ${location} ${attendees} ${organizerEmail}`;
          
          // Check for booking ID (most reliable)
          const hasBookingId = normalizedBookingId && allText.includes(normalizedBookingId);
          
          // Check for full tutor name
          const hasTutorName = normalizedTutorName && allText.includes(normalizedTutorName);
          
          // Check for first name (more flexible)
          const hasFirstName = firstName && firstName.length > 2 && allText.includes(firstName);
          
          // Check if tutor name appears in summary (common for appointment schedules)
          const summaryHasTutor = normalizedTutorName && summary.includes(normalizedTutorName);
          const summaryHasFirstName = firstName && firstName.length > 2 && summary.includes(firstName);
          
          const matches = hasBookingId || hasTutorName || summaryHasTutor || (hasFirstName && summaryHasFirstName);
          
          if (matches) {
            console.log(`   ✅ Potential match found: "${event.summary}"`);
            console.log(`      Has Booking ID: ${hasBookingId}`);
            console.log(`      Has Tutor Name: ${hasTutorName}`);
            console.log(`      Has First Name: ${hasFirstName}`);
            console.log(`      Summary Has Tutor: ${summaryHasTutor}`);
          }
          
          return matches;
        });

        if (matchingEvent && matchingEvent.id) {
          console.log('✅ Found matching event!');
          console.log('   Event ID:', matchingEvent.id);
          console.log('   Summary:', matchingEvent.summary);
          console.log('   Start:', matchingEvent.start?.dateTime || matchingEvent.start?.date);
          console.log('   Calendar ID:', calId);
          
          try {
            // Cancel the event
            console.log('🗑️  Attempting to delete event...');
            await calendar.events.delete({
              calendarId: calId,
              eventId: matchingEvent.id,
            });

            console.log('✅ Event deleted successfully!');
            return {
              success: true,
              message: 'Calendar event canceled successfully.',
              canceledEventId: matchingEvent.id,
            };
          } catch (deleteError: any) {
            console.error('❌ Error deleting event:', deleteError.message);
            console.error('   Error code:', deleteError.code);
            if (deleteError.response?.data) {
              console.error('   Error details:', JSON.stringify(deleteError.response.data, null, 2));
            }
            
            // If delete fails, try to return error info
            return {
              success: false,
              message: `Found event but could not delete: ${deleteError.message || 'Unknown error'}`,
              canceledEventId: matchingEvent.id,
            };
          }
        }
      } catch (calError: any) {
        console.error(`❌ Error searching calendar ${calId}:`, calError.message);
        // Continue searching other calendars
        continue;
      }
    }

    // If no matching event found, return success anyway (event might not exist yet or already canceled)
    console.log('⚠️  No matching calendar event found');
    return {
      success: true,
      message: 'No matching calendar event found to cancel. The event may have already been canceled or does not exist yet.',
    };
  } catch (error: any) {
    console.error('❌ Error canceling calendar event:', error);
    console.error('Error details:', {
      code: error.code,
      message: error.message,
      response: error.response?.data,
    });
    
    // If it's a permission error, provide helpful message
    if (error.code === 403 || error.code === 404) {
      return {
        success: false,
        message: `Permission denied (${error.code}). Make sure the calendar is shared with "peerpointtutors@gmail.com" and granted "Make changes to events" permission.`,
      };
    }

    return {
      success: false,
      message: `Error canceling calendar event: ${error.message || 'Unknown error'} (Code: ${error.code || 'N/A'})`,
    };
  }
}

/**
 * Store event ID when a booking is created (for easier cancellation later)
 * This would be called when a booking is verified and an event is created
 */
export async function storeEventId(
  bookingId: string,
  eventId: string,
  calendarId: string
): Promise<void> {
  // In a real implementation, you'd store this in your database
  // For now, we'll search for events when canceling
  // This is a placeholder for future enhancement
}
