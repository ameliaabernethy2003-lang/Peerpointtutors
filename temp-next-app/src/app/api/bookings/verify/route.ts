import { NextRequest, NextResponse } from 'next/server';
import { readJsonData, writeJsonData } from '../../../utils/db';

// Verify payment and confirm booking
export async function POST(request: NextRequest) {
  try {
    const { bookingId, verifiedBy } = await request.json();

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
      status: 'verified',
      verifiedAt: new Date().toISOString(),
      verifiedBy: verifiedBy || 'admin',
    };

    await writeJsonData('bookings', bookings);

    // Automatically create payment record when booking is verified
    try {
      const totalAmount = booking.amount || 17;
      const tutorRate = booking.rate ? parseInt(booking.rate.toString()) : null;
      let platformFee: number;
      let tutorAmount: number;
      
      if (tutorRate && tutorRate > 0) {
        platformFee = totalAmount - tutorRate;
        tutorAmount = tutorRate;
      } else {
        const rateMap: Record<number, number> = {
          17: 2, 22: 2, 27: 2, 33: 3, 38: 3, 44: 4, 49: 4, 55: 5,
        };
        platformFee = rateMap[totalAmount] || 2;
        tutorAmount = Math.max(0, totalAmount - platformFee);
      }

      const payments: any[] = await readJsonData('payments');
      const existingPayment = payments.find((p) => p.bookingId === booking.bookingId);
      
      if (!existingPayment) {
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
        };

        payments.push(payment);
        await writeJsonData('payments', payments);
      }
    } catch (error) {
      console.error('Error creating payment record:', error);
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
    console.error('Error verifying booking:', error);
    return NextResponse.json(
      { success: false, message: 'Error verifying booking' },
      { status: 500 }
    );
  }
}
