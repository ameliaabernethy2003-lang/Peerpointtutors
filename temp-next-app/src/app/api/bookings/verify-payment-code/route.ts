import { NextRequest, NextResponse } from 'next/server';
import { readJsonData, writeJsonData } from '../../../utils/db';

export async function POST(request: NextRequest) {
  try {
    const { bookingId, paymentCode } = await request.json();

    if (!bookingId || !paymentCode) {
      return NextResponse.json(
        { success: false, message: 'Missing bookingId or paymentCode' },
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

    const trimmedCode = paymentCode.trim().toUpperCase();
    
    if (!booking.verificationCode || trimmedCode !== booking.verificationCode.toUpperCase()) {
      return NextResponse.json(
        { success: false, message: 'Invalid verification code.' },
        { status: 400 }
      );
    }

    bookings[bookingIndex] = {
      ...booking,
      status: 'verified',
      verifiedAt: new Date().toISOString(),
      verifiedBy: 'payment-code',
      paymentCode: trimmedCode,
    };

    await writeJsonData('bookings', bookings);

    // Log the payment
    try {
      const payments: any[] = await readJsonData('payments');
      const totalAmount = booking.amount;
      const platformFee = 2;
      const tutorAmount = Math.max(0, totalAmount - platformFee);

      const payment = {
        id: `payment-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
        sessionId: booking.sessionId,
        bookingId: booking.bookingId,
        tutorName: booking.tutorName,
        tutorVenmo: booking.tutorVenmo || null,
        totalAmount,
        tutorAmount,
        platformFee,
        date: new Date().toISOString(),
        status: 'completed',
        paidOut: false,
        paymentCode: trimmedCode,
      };

      payments.push(payment);
      await writeJsonData('payments', payments);
    } catch (error) {
      console.error('Error logging payment:', error);
    }

    return NextResponse.json(
      {
        success: true,
        booking: bookings[bookingIndex],
        bookingUrl: booking.bookingUrl,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error verifying payment code:', error);
    return NextResponse.json(
      { success: false, message: 'Error verifying payment code' },
      { status: 500 }
    );
  }
}
