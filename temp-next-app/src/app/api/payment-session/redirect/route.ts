import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.redirect('/');
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
      return NextResponse.redirect('/');
    }

    // Find session by sessionId
    const session = sessions.find((s) => s.sessionId === sessionId);

    if (!session || !session.bookingUrl) {
      return NextResponse.redirect('/');
    }

    // Redirect to the booking URL
    return NextResponse.redirect(session.bookingUrl);
  } catch (error) {
    console.error('Error redirecting to booking:', error);
    return NextResponse.redirect('/');
  }
}
