import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';

export async function GET() {
  try {
    const overridesPath = join(process.cwd(), 'submissions', 'tutor-overrides.json');
    
    try {
      const overridesContent = await readFile(overridesPath, 'utf-8');
      const overrides = JSON.parse(overridesContent);
      return NextResponse.json({ overrides: overrides || {} });
    } catch {
      // File doesn't exist, return empty object
      return NextResponse.json({ overrides: {} });
    }
  } catch (error) {
    console.error('Error reading tutor overrides:', error);
    return NextResponse.json({ overrides: {} }, { status: 500 });
  }
}
