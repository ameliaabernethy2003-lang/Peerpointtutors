import { NextRequest, NextResponse } from 'next/server';
import { readJsonData, writeJsonData } from '../../../utils/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    let bookings: any[] = await readJsonData('bookings');

    // Filter expired bookings and update if needed
    const now = new Date();
    let needsUpdate = false;
    bookings = bookings.map((booking) => {
      if (booking.status === 'pending' && new Date(booking.expiresAt) < now) {
        needsUpdate = true;
        return { ...booking, status: 'expired' };
      }
      return booking;
    });

    if (needsUpdate) {
      await writeJsonData('bookings', bookings);
    }

    if (status) {
      bookings = bookings.filter((b) => b.status === status);
    }

    bookings.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return NextResponse.json(
      { success: true, bookings },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error listing bookings:', error);
    return NextResponse.json(
      { success: false, message: 'Error listing bookings' },
      { status: 500 }
    );
  }
}
