import { NextRequest, NextResponse } from 'next/server';
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';

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

    // Update booking to verified
    bookings[bookingIndex] = {
      ...booking,
      status: 'verified',
      verifiedAt: new Date().toISOString(),
      verifiedBy: verifiedBy || 'admin',
    };

    // Write back to file
    await writeFile(bookingsPath, JSON.stringify(bookings, null, 2), 'utf-8');

    // Automatically create payment record when booking is verified
    try {
      const totalAmount = booking.amount || 17; // Student payment amount (e.g., $17, $22, $33, etc.)
      // Calculate platform fee: student pays more than tutor rate
      // If tutor rate is stored, use it; otherwise calculate from amount
      const tutorRate = booking.rate ? parseInt(booking.rate.toString()) : null;
      let platformFee: number;
      let tutorAmount: number;
      
      if (tutorRate && tutorRate > 0) {
        // Platform fee is the difference between what student pays and tutor rate
        platformFee = totalAmount - tutorRate;
        tutorAmount = tutorRate;
      } else {
        // Fallback: estimate platform fee based on common rates
        // This is a fallback if tutor rate is not available
        const rateMap: Record<number, number> = {
          17: 2,  // $15 tutor rate → $17 student pays → $2 fee
          22: 2,  // $20 tutor rate → $22 student pays → $2 fee
          27: 2,  // $25 tutor rate → $27 student pays → $2 fee
          33: 3,  // $30 tutor rate → $33 student pays → $3 fee
          38: 3,  // $35 tutor rate → $38 student pays → $3 fee
          44: 4,  // $40 tutor rate → $44 student pays → $4 fee
          49: 4,  // $45 tutor rate → $49 student pays → $4 fee
          55: 5,  // $50 tutor rate → $55 student pays → $5 fee
        };
        platformFee = rateMap[totalAmount] || 2; // Default to $2 if not in map
        tutorAmount = Math.max(0, totalAmount - platformFee);
      }

      // Read existing payments
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

      // Check if payment record already exists for this booking
      const existingPayment = payments.find((p) => p.bookingId === booking.bookingId);
      
      if (!existingPayment) {
        // Create new payment record
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
        await writeFile(paymentsPath, JSON.stringify(payments, null, 2), 'utf-8');
      }
    } catch (error) {
      console.error('Error creating payment record:', error);
      // Don't fail verification if payment logging fails
    }

    return NextResponse.json(
      {
        success: true,
        booking: bookings[bookingIndex],
        bookingUrl: booking.bookingUrl, // Return booking URL for redirect
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
