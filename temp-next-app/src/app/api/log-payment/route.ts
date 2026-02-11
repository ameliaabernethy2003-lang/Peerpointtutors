import { NextRequest, NextResponse } from 'next/server';
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';

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

    // Read existing payments
    const paymentsPath = join(process.cwd(), 'submissions', 'payments.json');
    let payments: any[] = [];
    
    try {
      const paymentsContent = await readFile(paymentsPath, 'utf-8');
      payments = JSON.parse(paymentsContent);
      if (!Array.isArray(payments)) {
        payments = [];
      }
    } catch {
      // File doesn't exist, start with empty array
      payments = [];
    }

    // Create new payment record
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

    // Add to payments array
    payments.push(payment);

    // Write back to file
    await writeFile(paymentsPath, JSON.stringify(payments, null, 2), 'utf-8');

    return NextResponse.json({ success: true, payment }, { status: 200 });
  } catch (error) {
    console.error('Error logging payment:', error);
    return NextResponse.json(
      { success: false, message: 'Error logging payment' },
      { status: 500 }
    );
  }
}
