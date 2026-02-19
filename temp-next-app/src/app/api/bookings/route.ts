import { NextRequest, NextResponse } from 'next/server';
import { readJsonData, writeJsonData } from '../../utils/db';

function makeBookingId() {
  return `booking-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

// Create a new pending booking
export async function POST(request: NextRequest) {
  try {
    const { sessionId, tutorName, tutorVenmo, rate, bookingUrl, amount } = await request.json();

    if (!sessionId || !tutorName || !bookingUrl || !amount) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    const bookingId = makeBookingId();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 2);

    const bookings: any[] = await readJsonData('bookings');

    const tutorNameStr = String(tutorName);
    const newBooking = {
      bookingId,
      sessionId,
      tutorName: tutorNameStr,
      tutorVenmo: tutorVenmo || null,
      rate: rate || null,
      bookingUrl: String(bookingUrl),
      amount: parseFloat(amount),
      status: 'pending',
      paymentReference: tutorNameStr,
      createdAt: new Date().toISOString(),
      expiresAt: expiresAt.toISOString(),
      verifiedAt: null,
      verifiedBy: null,
    };

    bookings.push(newBooking);
    await writeJsonData('bookings', bookings);

    return NextResponse.json(
      {
        success: true,
        bookingId,
        paymentReference: newBooking.paymentReference,
        status: 'pending',
        expiresAt: expiresAt.toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error creating booking:', error);
    return NextResponse.json(
      { success: false, message: 'Error creating booking' },
      { status: 500 }
    );
  }
}

// Get booking status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const bookingId = searchParams.get('bookingId');
    const sessionId = searchParams.get('sessionId');

    if (!bookingId && !sessionId) {
      return NextResponse.json(
        { success: false, message: 'Missing bookingId or sessionId' },
        { status: 400 }
      );
    }

    const bookings: any[] = await readJsonData('bookings');

    const booking = bookings.find(
      (b) => b.bookingId === bookingId || b.sessionId === sessionId
    );

    if (!booking) {
      return NextResponse.json(
        { success: false, message: 'Booking not found' },
        { status: 404 }
      );
    }

    // Check if expired and update if needed
    const now = new Date();
    if (booking.status === 'pending' && new Date(booking.expiresAt) < now) {
      const bookingIndex = bookings.findIndex(
        (b) => b.bookingId === bookingId || b.sessionId === sessionId
      );
      if (bookingIndex !== -1) {
        bookings[bookingIndex].status = 'expired';
        await writeJsonData('bookings', bookings);
        booking.status = 'expired';
      }
    }

    return NextResponse.json(
      {
        success: true,
        booking: {
          bookingId: booking.bookingId,
          status: booking.status,
          paymentReference: booking.paymentReference,
          tutorName: booking.tutorName,
          amount: booking.amount,
          createdAt: booking.createdAt,
          expiresAt: booking.expiresAt,
          verifiedAt: booking.verifiedAt || null,
          rejectedAt: booking.rejectedAt || null,
          rejectedBy: booking.rejectedBy || null,
          paymentAmount: booking.paymentAmount || null,
          venmoAddress: booking.venmoAddress || null,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error reading booking:', error);
    return NextResponse.json(
      { success: false, message: 'Error reading booking' },
      { status: 500 }
    );
  }
}
