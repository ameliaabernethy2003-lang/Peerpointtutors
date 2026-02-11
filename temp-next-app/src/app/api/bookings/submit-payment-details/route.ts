import { NextRequest, NextResponse } from 'next/server';
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';

// Submit payment details for admin verification
export async function POST(request: NextRequest) {
  try {
    const { bookingId, paymentAmount, venmoAddress } = await request.json();

    if (!bookingId || !paymentAmount || !venmoAddress) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
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

    // Store payment details - status remains pending until admin verifies
    bookings[bookingIndex] = {
      ...booking,
      paymentAmount: parseFloat(paymentAmount),
      venmoAddress: venmoAddress.trim(),
      paymentDetailsSubmittedAt: new Date().toISOString(),
      // Status remains 'pending' - admin must verify
    };

    // Write back to file
    await writeFile(bookingsPath, JSON.stringify(bookings, null, 2), 'utf-8');

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
