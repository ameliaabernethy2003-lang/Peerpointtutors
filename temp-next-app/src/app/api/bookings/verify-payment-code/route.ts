import { NextRequest, NextResponse } from 'next/server';
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';

// Verify payment using a payment code (Venmo transaction ID or confirmation code)
export async function POST(request: NextRequest) {
  try {
    const { bookingId, paymentCode } = await request.json();

    if (!bookingId || !paymentCode) {
      return NextResponse.json(
        { success: false, message: 'Missing bookingId or paymentCode' },
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

    if (booking.status !== 'pending') {
      return NextResponse.json(
        { success: false, message: `Booking is already ${booking.status}` },
        { status: 400 }
      );
    }

    // Check if expired
    if (new Date(booking.expiresAt) < new Date()) {
      bookings[bookingIndex].status = 'expired';
      await writeFile(bookingsPath, JSON.stringify(bookings, null, 2), 'utf-8');
      return NextResponse.json(
        { success: false, message: 'Booking has expired' },
        { status: 400 }
      );
    }

    const trimmedCode = paymentCode.trim().toUpperCase();
    
    // Validate the code matches the generated verification code
    if (!booking.verificationCode || trimmedCode !== booking.verificationCode.toUpperCase()) {
      return NextResponse.json(
        { success: false, message: 'Invalid verification code. Please check your booking confirmation or create a new booking.' },
        { status: 400 }
      );
    }

    // Code matches! Verify the booking automatically
    bookings[bookingIndex] = {
      ...booking,
      status: 'verified',
      verifiedAt: new Date().toISOString(),
      verifiedBy: 'payment-code',
      paymentCode: trimmedCode, // Store for reference
    };

    // Write back to file
    await writeFile(bookingsPath, JSON.stringify(bookings, null, 2), 'utf-8');

    // Log the payment
    try {
      const paymentsPath = join(process.cwd(), 'submissions', 'payments.json');
      let payments: any[] = [];
      
      try {
        const paymentsContent = await readFile(paymentsPath, 'utf-8');
        payments = JSON.parse(paymentsContent);
        if (!Array.isArray(payments)) {
          payments = [];
        }
      } catch {
        payments = [];
      }

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
      await writeFile(paymentsPath, JSON.stringify(payments, null, 2), 'utf-8');
    } catch (error) {
      console.error('Error logging payment:', error);
      // Don't fail verification if payment logging fails
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
