import { NextRequest, NextResponse } from 'next/server';
import { readJsonData, writeJsonData } from '../../../utils/db';

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

    const bookings: any[] = await readJsonData('bookings');
    const initialLength = bookings.length;
    const filtered = bookings.filter((b) => b.bookingId !== bookingId);

    if (filtered.length === initialLength) {
      return NextResponse.json(
        { success: false, message: 'Booking not found' },
        { status: 404 }
      );
    }

    await writeJsonData('bookings', filtered);

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
