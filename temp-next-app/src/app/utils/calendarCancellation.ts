/**
 * Alternative Calendar Cancellation Methods
 * These don't require Google Calendar API setup
 */

/**
 * Method 1: Generate cancellation link using Google Calendar's public cancellation
 * This works if we have the event ID or attendee email
 */
export function generateCancellationLink(eventId: string, calendarId: string): string {
  // Google Calendar public cancellation link format
  return `https://calendar.google.com/calendar/event?action=CANCEL&eid=${eventId}&ctz=UTC`;
}

/**
 * Method 2: Generate cancellation instructions for manual cancellation
 */
export function generateCancellationInstructions(
  tutorName: string,
  bookingId: string,
  studentVenmo?: string
): string {
  return `
CANCELLATION INSTRUCTIONS
==========================

Booking ID: ${bookingId}
Tutor: ${tutorName}
${studentVenmo ? `Student Venmo: ${studentVenmo}` : ''}

To cancel this appointment:
1. Open Google Calendar
2. Find the appointment with booking ID: ${bookingId}
3. Click on the event
4. Click "Delete" or "Cancel event"
5. Confirm cancellation

Alternatively, if you have the event link, you can cancel it directly.
`;
}

/**
 * Method 3: Extract event ID from booking URL if possible
 * Google Calendar appointment schedules sometimes include event info
 */
export function extractEventInfoFromBooking(bookingUrl: string): {
  calendarId: string | null;
  canExtractEventId: boolean;
} {
  // Try to extract calendar ID from appointment schedule URL
  const calendarIdMatch = bookingUrl.match(/\/appointments\/schedules\/([a-zA-Z0-9_-]+)/);
  const calendarId = calendarIdMatch ? calendarIdMatch[1] : null;

  // Note: We can't extract event ID from the booking URL alone
  // Event IDs are only available after the event is created
  return {
    calendarId,
    canExtractEventId: false,
  };
}

/**
 * Method 4: Generate email cancellation request
 */
export function generateCancellationEmail(
  tutorEmail: string,
  tutorName: string,
  bookingId: string,
  studentVenmo?: string
): {
  to: string;
  subject: string;
  body: string;
} {
  return {
    to: tutorEmail,
    subject: `[ACTION REQUIRED] Cancel Appointment - Booking ${bookingId}`,
    body: `
Hello ${tutorName},

A booking has been rejected and needs to be canceled in your calendar.

Booking Details:
- Booking ID: ${bookingId}
${studentVenmo ? `- Student Venmo: ${studentVenmo}` : ''}

Please cancel this appointment in your Google Calendar:
1. Open Google Calendar
2. Search for booking ID: ${bookingId}
3. Delete/cancel the event

Thank you!
PeerPoint Admin
    `.trim(),
  };
}
