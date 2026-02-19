import { NextResponse } from 'next/server';
import { readJsonData } from '../../utils/db';

export async function GET() {
  try {
    const removed = await readJsonData('removed-static-tutors');
    return NextResponse.json({ removed: Array.isArray(removed) ? removed : [] });
  } catch (error) {
    console.error('Error reading removed static tutors:', error);
    return NextResponse.json({ removed: [] }, { status: 500 });
  }
}
