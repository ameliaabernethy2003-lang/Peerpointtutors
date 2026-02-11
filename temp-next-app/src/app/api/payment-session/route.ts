import { NextRequest, NextResponse } from 'next/server';
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';

function makeSessionId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export async function POST(request: NextRequest) {
  try {
    const { tutorName, tutorVenmo, rate, bookingUrl } = await request.json();

    if (!tutorName || !bookingUrl) {
      return NextResponse.json(
        { success: false, message: 'Missing tutorName or bookingUrl' },
        { status: 400 }
      );
    }

    const sessionId = makeSessionId();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // 24 hour expiry

    // Read existing sessions
    const sessionsPath = join(process.cwd(), 'submissions', 'payment-sessions.json');
    let sessions: any[] = [];
    
    try {
      const sessionsContent = await readFile(sessionsPath, 'utf-8');
      sessions = JSON.parse(sessionsContent);
      if (!Array.isArray(sessions)) {
        sessions = [];
      }
    } catch {
      // File doesn't exist, start with empty array
      sessions = [];
    }

    // Create new session
    const newSession = {
      sessionId,
      tutorName: String(tutorName),
      tutorVenmo: tutorVenmo ? String(tutorVenmo) : null,
      rate: rate ? String(rate) : null,
      bookingUrl: String(bookingUrl),
      expiresAt: expiresAt.toISOString(),
      createdAt: new Date().toISOString(),
    };

    // Add to sessions array
    sessions.push(newSession);

    // Write back to file
    await writeFile(sessionsPath, JSON.stringify(sessions, null, 2), 'utf-8');

    return NextResponse.json(
      { success: true, sessionId: sessionId },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error creating payment session:', error);
    return NextResponse.json(
      { success: false, message: 'Error creating payment session' },
      { status: 500 }
    );
  }
}

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

    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Session not found' },
        { status: 404 }
      );
    }

    // Check if session expired
    if (session.expiresAt && new Date(session.expiresAt) < new Date()) {
      return NextResponse.json(
        { success: false, message: 'Session expired' },
        { status: 410 }
      );
    }

    // IMPORTANT: do not return bookingUrl to the browser
    return NextResponse.json(
      {
        success: true,
        tutorName: session.tutorName,
        tutorVenmo: session.tutorVenmo || '',
        rate: session.rate || '',
        createdAt: session.createdAt,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error reading payment session:', error);
    return NextResponse.json(
      { success: false, message: 'Error reading payment session' },
      { status: 500 }
    );
  }
}
