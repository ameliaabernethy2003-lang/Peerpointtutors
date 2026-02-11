import { NextRequest, NextResponse } from 'next/server';
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';

// Get all bookings (for admin)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status'); // Filter by status: pending, verified, expired, cancelled

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
      // File doesn't exist, return empty array
      return NextResponse.json({ success: true, bookings: [] }, { status: 200 });
    }

    // Filter expired bookings and update file if needed
    const now = new Date();
    let needsUpdate = false;
    bookings = bookings.map((booking) => {
      if (booking.status === 'pending' && new Date(booking.expiresAt) < now) {
        needsUpdate = true;
        return { ...booking, status: 'expired' };
      }
      return booking;
    });

    // Write back if any bookings were expired
    if (needsUpdate) {
      try {
        await writeFile(bookingsPath, JSON.stringify(bookings, null, 2), 'utf-8');
      } catch (error) {
        console.error('Error updating expired bookings:', error);
      }
    }

    // Filter by status if provided
    if (status) {
      bookings = bookings.filter((b) => b.status === status);
    }

    // Sort by createdAt (newest first)
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
