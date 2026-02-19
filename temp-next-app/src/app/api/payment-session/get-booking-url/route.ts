import { NextRequest, NextResponse } from 'next/server';
import { readJsonData } from '../../../utils/db';

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

    if (!session || !session.bookingUrl) {
      return NextResponse.json(
        { success: false, message: 'Session not found or booking URL missing' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, bookingUrl: session.bookingUrl },
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
