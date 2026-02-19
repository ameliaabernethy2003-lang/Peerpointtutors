import { NextRequest, NextResponse } from 'next/server';
import { readJsonData, writeJsonData } from '../../../utils/db';
import { cancelCalendarEvent } from '../../../utils/googleCalendar';

export async function POST(request: NextRequest) {
  try {
    const { bookingId, rejectedBy } = await request.json();

    if (!bookingId) {
      return NextResponse.json(
        { success: false, message: 'Missing bookingId' },
        { status: 400 }
      );
    }

    const bookings: any[] = await readJsonData('bookings');
    const bookingIndex = bookings.findIndex((b) => b.bookingId === bookingId);

    if (bookingIndex === -1) {
      return NextResponse.json(
        { success: false, message: 'Booking not found' },
        { status: 404 }
      );
    }

    const booking = bookings[bookingIndex];

    if (booking.status !== 'pending' && booking.status !== 'verified') {
      return NextResponse.json(
        { success: false, message: `Cannot reject booking with status: ${booking.status}` },
        { status: 400 }
      );
    }

    // Try to cancel calendar event
    let calendarCancelResult = null;
    if (booking.bookingUrl) {
      try {
        calendarCancelResult = await cancelCalendarEvent(
          booking.bookingUrl,
          booking.tutorName,
          booking.bookingId
        );
      } catch (error) {
        console.error('Error canceling calendar event:', error);
      }
    }
    
    const needsManualCancellation = !calendarCancelResult?.success;

    bookings[bookingIndex] = {
      ...booking,
      status: 'rejected',
      rejectedAt: new Date().toISOString(),
      rejectedBy: rejectedBy || 'admin',
      bookingUrl: null,
      calendarCanceled: calendarCancelResult?.success || false,
      calendarCancelMessage: calendarCancelResult?.message || null,
    };

    await writeJsonData('bookings', bookings);

    let message = '';
    if (calendarCancelResult?.success) {
      message = 'Booking rejected and calendar event canceled.';
    } else if (needsManualCancellation && booking.bookingUrl) {
      message = 'Booking rejected. Please manually cancel the calendar event.';
    } else {
      message = 'Booking rejected successfully.';
    }

    return NextResponse.json(
      {
        success: true,
        message,
        booking: bookings[bookingIndex],
        calendarCanceled: calendarCancelResult?.success || false,
        needsManualCancellation: needsManualCancellation && booking.bookingUrl ? true : false,
        cancellationInstructions: needsManualCancellation && booking.bookingUrl ? {
          bookingId: booking.bookingId,
          tutorName: booking.tutorName,
          bookingUrl: booking.bookingUrl,
        } : null,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error rejecting booking:', error);
    return NextResponse.json(
      { success: false, message: 'Error rejecting booking' },
      { status: 500 }
    );
  }
}
