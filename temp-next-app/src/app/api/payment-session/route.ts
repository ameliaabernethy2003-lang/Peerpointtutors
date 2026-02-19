import { NextRequest, NextResponse } from 'next/server';
import { readJsonData, writeJsonData } from '../../utils/db';

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
    expiresAt.setHours(expiresAt.getHours() + 24);

    const sessions: any[] = await readJsonData('payment-sessions');

    const newSession = {
      sessionId,
      tutorName: String(tutorName),
      tutorVenmo: tutorVenmo ? String(tutorVenmo) : null,
      rate: rate ? String(rate) : null,
      bookingUrl: String(bookingUrl),
      expiresAt: expiresAt.toISOString(),
      createdAt: new Date().toISOString(),
    };

    sessions.push(newSession);
    await writeJsonData('payment-sessions', sessions);

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

    const sessions: any[] = await readJsonData('payment-sessions');
    const session = sessions.find((s) => s.sessionId === sessionId);

    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Session not found' },
        { status: 404 }
      );
    }

    if (session.expiresAt && new Date(session.expiresAt) < new Date()) {
      return NextResponse.json(
        { success: false, message: 'Session expired' },
        { status: 410 }
      );
    }

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
