import { NextRequest, NextResponse } from 'next/server';
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';

// Delete a payment
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const paymentId = searchParams.get('paymentId');

    if (!paymentId) {
      return NextResponse.json(
        { success: false, message: 'Missing paymentId' },
        { status: 400 }
      );
    }

    // Read payments from JSON file
    const paymentsPath = join(process.cwd(), 'submissions', 'payments.json');
    let payments: any[] = [];
    
    try {
      const paymentsContent = await readFile(paymentsPath, 'utf-8');
      payments = JSON.parse(paymentsContent);
      if (!Array.isArray(payments)) {
        payments = [];
      }
    } catch {
      return NextResponse.json(
        { success: false, message: 'Payments file not found' },
        { status: 404 }
      );
    }

    // Find and remove payment
    const initialLength = payments.length;
    payments = payments.filter((p) => p.id !== paymentId);

    if (payments.length === initialLength) {
      return NextResponse.json(
        { success: false, message: 'Payment not found' },
        { status: 404 }
      );
    }

    // Write back to file
    await writeFile(paymentsPath, JSON.stringify(payments, null, 2), 'utf-8');

    return NextResponse.json(
      { success: true, message: 'Payment deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting payment:', error);
    return NextResponse.json(
      { success: false, message: 'Error deleting payment' },
      { status: 500 }
    );
  }
}
