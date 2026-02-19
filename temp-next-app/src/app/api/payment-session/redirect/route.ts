import { NextRequest, NextResponse } from 'next/server';
import { readJsonData } from '../../../utils/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.redirect('/');
    }

    const sessions: any[] = await readJsonData('payment-sessions');
    const session = sessions.find((s) => s.sessionId === sessionId);

    if (!session || !session.bookingUrl) {
      return NextResponse.redirect('/');
    }

    return NextResponse.redirect(session.bookingUrl);
  } catch (error) {
    console.error('Error redirecting to booking:', error);
    return NextResponse.redirect('/');
  }
}
