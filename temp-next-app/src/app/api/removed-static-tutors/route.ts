import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';

export async function GET() {
  try {
    const removedPath = join(process.cwd(), 'submissions', 'removed-static-tutors.json');
    
    try {
      const removedContent = await readFile(removedPath, 'utf-8');
      const removed = JSON.parse(removedContent);
      return NextResponse.json({ removed: Array.isArray(removed) ? removed : [] });
    } catch {
      // File doesn't exist, return empty array
      return NextResponse.json({ removed: [] });
    }
  } catch (error) {
    console.error('Error reading removed static tutors:', error);
    return NextResponse.json({ removed: [] }, { status: 500 });
  }
}
