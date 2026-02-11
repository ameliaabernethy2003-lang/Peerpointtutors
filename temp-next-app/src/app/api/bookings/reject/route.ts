import { NextRequest, NextResponse } from 'next/server';
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import { cancelCalendarEvent } from '../../../utils/googleCalendar';

// Reject a booking (admin action when payment not received or doesn't match)
export async function POST(request: NextRequest) {
  try {
    const { bookingId, rejectedBy } = await request.json();

    if (!bookingId) {
      return NextResponse.json(
        { success: false, message: 'Missing bookingId' },
        { status: 400 }
      );
    }

    // Read bookings from JSON file
    const bookingsPath = join(process.cwd(), 'submissions', 'bookings.json');
    let bookings: any[] = [];
    
    try {
      const bookingsContent = await readFile(bookingsPath, 'utf-8');
      bookings = JSON.parse(bookingsContent);
      if (!Array.isArray(bookings)) {
        bookings = [];
      }
    } catch {
      return NextResponse.json(
        { success: false, message: 'Bookings file not found' },
        { status: 404 }
      );
    }

    // Find booking
    const bookingIndex = bookings.findIndex((b) => b.bookingId === bookingId);

    if (bookingIndex === -1) {
      return NextResponse.json(
        { success: false, message: 'Booking not found' },
        { status: 404 }
      );
    }

    const booking = bookings[bookingIndex];

    // Can reject pending or verified bookings (to cancel appointments)
    if (booking.status !== 'pending' && booking.status !== 'verified') {
      return NextResponse.json(
        { success: false, message: `Cannot reject booking with status: ${booking.status}` },
        { status: 400 }
      );
    }

    // Try to cancel calendar event via API (if configured)
    // If not configured, we'll provide manual cancellation instructions
    let calendarCancelResult = null;
    if (booking.bookingUrl) {
      try {
        console.log('🔄 Attempting to cancel calendar event for booking:', booking.bookingId);
        console.log('   Booking URL:', booking.bookingUrl);
        console.log('   Tutor Name:', booking.tutorName);
        
        calendarCancelResult = await cancelCalendarEvent(
          booking.bookingUrl,
          booking.tutorName,
          booking.bookingId
        );
        
        console.log('📋 Calendar cancellation result:', JSON.stringify(calendarCancelResult, null, 2));
        
        if (!calendarCancelResult.success) {
          console.warn('⚠️  Calendar cancellation failed:', calendarCancelResult.message);
        } else {
          console.log('✅ Calendar event canceled successfully!');
        }
      } catch (error: any) {
        console.error('❌ Error canceling calendar event:', error);
        console.error('   Error code:', error.code);
        console.error('   Error message:', error.message);
        // Continue with rejection even if calendar cancellation fails
      }
    } else {
      console.log('⚠️  No booking URL found, skipping calendar cancellation');
    }
    
    // If API cancellation failed or isn't configured, set up for manual cancellation
    const needsManualCancellation = !calendarCancelResult?.success;

    // Update booking status to rejected/cancelled
    bookings[bookingIndex] = {
      ...booking,
      status: 'rejected',
      rejectedAt: new Date().toISOString(),
      rejectedBy: rejectedBy || 'admin',
      // Clear booking URL to prevent access
      bookingUrl: null,
      calendarCanceled: calendarCancelResult?.success || false,
      calendarCancelMessage: calendarCancelResult?.message || null,
    };

    // Write back to file
    await writeFile(bookingsPath, JSON.stringify(bookings, null, 2), 'utf-8');

    let message = '';
    if (calendarCancelResult?.success) {
      message = 'Booking rejected and calendar event canceled. Time slot has been released.';
    } else if (needsManualCancellation && booking.bookingUrl) {
      message = 'Booking rejected. Please manually cancel the calendar event. Cancellation instructions are shown below.';
    } else {
      message = 'Booking rejected successfully. Time slot has been released.';
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
