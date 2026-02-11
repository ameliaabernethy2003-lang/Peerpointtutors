import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';

// Get booking URL from session (server-side only, for creating bookings)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        { success: false, message: 'Missing sessionId' },
        { status: 400 }
      );
    }

    // Read sessions from JSON file
    const sessionsPath = join(process.cwd(), 'submissions', 'payment-sessions.json');
    let sessions: any[] = [];
    
    try {
      const sessionsContent = await readFile(sessionsPath, 'utf-8');
      sessions = JSON.parse(sessionsContent);
      if (!Array.isArray(sessions)) {
        sessions = [];
      }
    } catch {
      return NextResponse.json(
        { success: false, message: 'Session not found' },
        { status: 404 }
      );
    }

    // Find session by sessionId
    const session = sessions.find((s) => s.sessionId === sessionId);

    if (!session || !session.bookingUrl) {
      return NextResponse.json(
        { success: false, message: 'Session not found or booking URL missing' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        bookingUrl: session.bookingUrl,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error getting booking URL:', error);
    return NextResponse.json(
      { success: false, message: 'Error getting booking URL' },
      { status: 500 }
    );
  }
}
