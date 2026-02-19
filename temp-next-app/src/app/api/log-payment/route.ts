import { NextRequest, NextResponse } from 'next/server';
import { readJsonData, writeJsonData } from '../../utils/db';

export async function POST(request: NextRequest) {
  try {
    const { sessionId, tutorName, amount, tutorVenmo } = await request.json();

    if (!sessionId || !tutorName || !amount) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Calculate split: $2 platform fee, rest goes to tutor
    const totalAmount = parseFloat(amount);
    const platformFee = 2;
    const tutorAmount = Math.max(0, totalAmount - platformFee);

    const payments: any[] = await readJsonData('payments');

    const payment = {
      id: `payment-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
      sessionId,
      tutorName,
      tutorVenmo: tutorVenmo || null,
      totalAmount,
      tutorAmount,
      platformFee,
      date: new Date().toISOString(),
      status: 'completed',
      paidOut: false,
    };

    payments.push(payment);
    await writeJsonData('payments', payments);

    return NextResponse.json({ success: true, payment }, { status: 200 });
  } catch (error) {
    console.error('Error logging payment:', error);
    return NextResponse.json(
      { success: false, message: 'Error logging payment' },
      { status: 500 }
    );
  }
}
