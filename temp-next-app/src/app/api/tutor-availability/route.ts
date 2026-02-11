import { NextRequest, NextResponse } from 'next/server';
import { extractCalendarId } from '../../utils/googleCalendar';

// Import googleapis - handle gracefully if not available
// eslint-disable-next-line @typescript-eslint/no-require-imports
let google: any = null;
try {
  google = require('googleapis').google;
} catch {
  google = null;
}

/**
 * Initialize Google Calendar API client
 */
function getCalendarClient() {
  const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!serviceAccountEmail || !privateKey) {
    return null;
  }

  try {
    const auth = new google.auth.JWT({
      email: serviceAccountEmail,
      key: privateKey,
      scopes: ['https://www.googleapis.com/auth/calendar.readonly'],
    });

    return google.calendar({ version: 'v3', auth });
  } catch (error) {
    console.error('Error initializing Google Calendar client:', error);
    return null;
  }
}

/**
 * Generate mock availability data for demonstration
 * In production, this would fetch from Google Calendar API
 */
function generateMockAvailability(): Array<{ date: string; time: string; available: boolean }> {
  const availability: Array<{ date: string; time: string; available: boolean }> = [];
  const today = new Date();
  
  // Generate availability for next 7 days
  for (let dayOffset = 1; dayOffset <= 7; dayOffset++) {
    const date = new Date(today);
    date.setDate(date.getDate() + dayOffset);
    
    // Skip weekends for this example
    if (date.getDay() === 0 || date.getDay() === 6) continue;
    
    const dateStr = date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
    
    // Generate 3-5 time slots per day
    const numSlots = Math.floor(Math.random() * 3) + 3;
    const startHour = 10; // 10 AM
    
    for (let i = 0; i < numSlots; i++) {
      const hour = startHour + i * 2; // Every 2 hours
      const timeStr = `${hour % 12 || 12}:00 ${hour >= 12 ? 'PM' : 'AM'}`;
      
      // Randomly make some slots unavailable (20% chance)
      const available = Math.random() > 0.2;
      
      availability.push({
        date: dateStr,
        time: timeStr,
        available,
      });
    }
  }
  
  return availability;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const bookingUrl = searchParams.get('bookingUrl');

    if (!bookingUrl) {
      return NextResponse.json(
        { success: false, error: 'Booking URL is required' },
        { status: 400 }
      );
    }

    // Extract calendar ID from booking URL
    const calendarId = extractCalendarId(bookingUrl);

    if (!calendarId) {
      // If we can't extract calendar ID, return mock data
      const mockAvailability = generateMockAvailability();
      return NextResponse.json({
        success: true,
        availability: mockAvailability,
        note: 'Using sample availability. Could not extract calendar ID from booking URL.',
      });
    }

    // Try to fetch real availability from Google Calendar
    if (!google) {
      // Fallback to mock data if googleapis not available
      const mockAvailability = generateMockAvailability();
      return NextResponse.json({
        success: true,
        availability: mockAvailability,
        note: 'Using sample availability. Google Calendar API not available.',
      });
    }

    const calendar = getCalendarClient();
    
    if (!calendar) {
      // Fallback to mock data if API not configured
      const mockAvailability = generateMockAvailability();
      return NextResponse.json({
        success: true,
        availability: mockAvailability,
        note: 'Using sample availability. Google Calendar API not configured.',
      });
    }

    try {
      // Get current time and time 14 days from now
      const now = new Date();
      const timeMin = new Date(now);
      timeMin.setHours(0, 0, 0, 0); // Start of today
      const timeMax = new Date(now);
      timeMax.setDate(timeMax.getDate() + 14); // 14 days from now
      timeMax.setHours(23, 59, 59, 999); // End of day

      // Use freebusy API - this should respect appointment schedule availability windows
      // Times outside the tutor's configured availability will be marked as "busy"
      // Times outside the tutor's configured availability will be marked as "busy"
      const freebusyResponse = await calendar.freebusy.query({
        requestBody: {
          timeMin: timeMin.toISOString(),
          timeMax: timeMax.toISOString(),
          items: [{ id: calendarId }],
        },
      });

      const busyPeriods = freebusyResponse.data.calendars?.[calendarId]?.busy || [];
      
      // Calculate FREE periods (inverse of busy periods)
      // These represent times within the tutor's configured availability windows that are not booked
      const freePeriods: Array<{ start: Date; end: Date }> = [];
      
      let currentTime = new Date(Math.max(timeMin.getTime(), now.getTime()));
      
      // Sort busy periods by start time
      const sortedBusyPeriods = [...busyPeriods]
        .map((b: any) => ({ start: new Date(b.start), end: new Date(b.end) }))
        .sort((a, b) => a.start.getTime() - b.start.getTime());
      
      // Find free periods between busy periods
      // Free periods = times that are NOT busy, which means they're within availability windows
      for (const busy of sortedBusyPeriods) {
        // If there's a gap before this busy period, it's a free period
        if (currentTime < busy.start) {
          freePeriods.push({
            start: new Date(currentTime),
            end: new Date(busy.start),
          });
        }
        
        // Move current time to end of busy period
        currentTime = busy.end > currentTime ? busy.end : currentTime;
      }
      
      // Add any remaining free time after the last busy period
      if (currentTime < timeMax) {
        freePeriods.push({
          start: new Date(currentTime),
          end: new Date(timeMax),
        });
      }
      
      // Generate available time slots ONLY from free periods
      // These free periods represent times within the tutor's configured availability windows
      const availability: Array<{ date: string; time: string; available: boolean }> = [];
      
      // For each free period, generate hourly slots
      for (const freePeriod of freePeriods) {
        const periodStart = new Date(freePeriod.start);
        const periodEnd = new Date(freePeriod.end);
        
        // Skip if period is entirely in the past
        if (periodEnd < now) continue;
        
        // Generate hourly slots within this free period
        let slotTime = new Date(Math.max(periodStart.getTime(), now.getTime()));
        slotTime.setMinutes(0, 0, 0); // Round to the hour
        
        while (slotTime < periodEnd) {
          const slotEnd = new Date(slotTime);
          slotEnd.setHours(slotEnd.getHours() + 1);
          
          // Only include if the full hour slot fits within the free period
          if (slotEnd <= periodEnd && slotTime >= now) {
            const dateStr = slotTime.toLocaleDateString('en-US', { 
              weekday: 'short', 
              month: 'short', 
              day: 'numeric' 
            });
            const hour = slotTime.getHours();
            const timeStr = `${hour % 12 || 12}:00 ${hour >= 12 ? 'PM' : 'AM'}`;
            
            availability.push({
              date: dateStr,
              time: timeStr,
              available: true,
            });
          }
          
          // Move to next hour
          slotTime.setHours(slotTime.getHours() + 1);
        }
      }
      
      // Sort by date and time for consistent display
      availability.sort((a, b) => {
        // Parse dates for comparison
        const dateA = new Date(a.date + ' ' + (new Date().getFullYear()));
        const dateB = new Date(b.date + ' ' + (new Date().getFullYear()));
        const dateCompare = dateA.getTime() - dateB.getTime();
        if (dateCompare !== 0) return dateCompare;
        
        // Parse time for comparison
        const parseTime = (timeStr: string) => {
          const [time, period] = timeStr.split(' ');
          const [hour] = time.split(':');
          let hourNum = parseInt(hour);
          if (period === 'PM' && hourNum !== 12) hourNum += 12;
          if (period === 'AM' && hourNum === 12) hourNum = 0;
          return hourNum;
        };
        
        return parseTime(a.time) - parseTime(b.time);
      });
      
      // Return available slots from the tutor's appointment schedule
      return NextResponse.json({
        success: true,
        availability,
        calendarId,
        note: availability.length > 0 
          ? 'Available slots from tutor\'s appointment schedule' 
          : 'No available slots found. The tutor may not have availability windows configured or all slots are booked.',
      });
    } catch (error: any) {
      console.error('Error fetching calendar availability:', error);
      
      // Fallback to mock data on error
      const mockAvailability = generateMockAvailability();
      return NextResponse.json({
        success: true,
        availability: mockAvailability,
        note: `Using sample availability. Error fetching calendar: ${error.message || 'Unknown error'}`,
      });
    }
  } catch (error) {
    console.error('Error fetching availability:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch availability' },
      { status: 500 }
    );
  }
}

