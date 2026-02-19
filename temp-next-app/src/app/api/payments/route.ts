import { NextResponse } from 'next/server';
import { readJsonData } from '../../utils/db';

export async function GET() {
  try {
    const payments = await readJsonData('payments');
    return NextResponse.json({ payments });
  } catch (error: any) {
    console.error('Error reading payments:', error?.message || error);
    return NextResponse.json({ payments: [] }, { status: 500 });
  }
}
