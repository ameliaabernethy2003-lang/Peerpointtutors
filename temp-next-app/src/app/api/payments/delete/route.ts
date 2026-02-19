import { NextRequest, NextResponse } from 'next/server';
import { readJsonData, writeJsonData } from '../../../utils/db';

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

    const payments: any[] = await readJsonData('payments');
    const initialLength = payments.length;
    const filtered = payments.filter((p) => p.id !== paymentId);

    if (filtered.length === initialLength) {
      return NextResponse.json(
        { success: false, message: 'Payment not found' },
        { status: 404 }
      );
    }

    await writeJsonData('payments', filtered);

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
