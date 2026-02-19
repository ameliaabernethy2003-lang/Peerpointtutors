import { NextRequest, NextResponse } from 'next/server';
import { readJsonData, writeJsonData } from '../../../utils/db';

export async function POST(request: NextRequest) {
  try {
    const { bookingId, paymentAmount, venmoAddress } = await request.json();

    if (!bookingId || !paymentAmount || !venmoAddress) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
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

    if (booking.status !== 'pending') {
      return NextResponse.json(
        { success: false, message: `Booking is already ${booking.status}` },
        { status: 400 }
      );
    }

    if (new Date(booking.expiresAt) < new Date()) {
      bookings[bookingIndex].status = 'expired';
      await writeJsonData('bookings', bookings);
      return NextResponse.json(
        { success: false, message: 'Booking has expired' },
        { status: 400 }
      );
    }

    bookings[bookingIndex] = {
      ...booking,
      paymentAmount: parseFloat(paymentAmount),
      venmoAddress: venmoAddress.trim(),
      paymentDetailsSubmittedAt: new Date().toISOString(),
    };

    await writeJsonData('bookings', bookings);

    return NextResponse.json(
      {
        success: true,
        message: 'Payment details submitted successfully. Waiting for admin verification.',
        booking: bookings[bookingIndex],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error submitting payment details:', error);
    return NextResponse.json(
      { success: false, message: 'Error submitting payment details' },
      { status: 500 }
    );
  }
}
