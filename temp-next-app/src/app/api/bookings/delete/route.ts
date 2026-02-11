import { NextRequest, NextResponse } from 'next/server';
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';

// Delete a booking
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const bookingId = searchParams.get('bookingId');

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

    // Find and remove booking
    const initialLength = bookings.length;
    bookings = bookings.filter((b) => b.bookingId !== bookingId);

    if (bookings.length === initialLength) {
      return NextResponse.json(
        { success: false, message: 'Booking not found' },
        { status: 404 }
      );
    }

    // Write back to file
    await writeFile(bookingsPath, JSON.stringify(bookings, null, 2), 'utf-8');

    return NextResponse.json(
      { success: true, message: 'Booking deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting booking:', error);
    return NextResponse.json(
      { success: false, message: 'Error deleting booking' },
      { status: 500 }
    );
  }
}
