import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';

export async function GET() {
  try {
    // Use process.cwd() which should point to the project root
    const jsonPath = join(process.cwd(), 'submissions', 'payments.json');
    
    try {
      const fileContent = await readFile(jsonPath, 'utf-8');
      const payments = JSON.parse(fileContent);
      return NextResponse.json({ payments });
    } catch (readError: any) {
      console.error('Error reading file:', readError?.message);
      console.error('Attempted path:', jsonPath);
      // Return empty array on error
      return NextResponse.json({ payments: [] });
    }
  } catch (error: any) {
    console.error('Unexpected error in GET handler:', error?.message || error);
    return NextResponse.json({ payments: [] }, { status: 500 });
  }
}
