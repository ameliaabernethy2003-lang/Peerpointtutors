import { NextResponse } from 'next/server';
import { readJsonData } from '../../utils/db';

export async function GET() {
  try {
    const overrides = await readJsonData('tutor-overrides');
    return NextResponse.json({ overrides: overrides || {} });
  } catch (error) {
    console.error('Error reading tutor overrides:', error);
    return NextResponse.json({ overrides: {} }, { status: 500 });
  }
}
