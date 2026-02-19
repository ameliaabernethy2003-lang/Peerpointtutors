import { NextResponse } from 'next/server';
import { readJsonData } from '../../utils/db';

export async function GET() {
  try {
    const submissions = await readJsonData('tutor-submissions');
    return NextResponse.json(submissions);
  } catch (error: any) {
    console.error('Error reading submissions:', error?.message || error);
    return NextResponse.json([], { status: 500 });
  }
}
