import { NextRequest, NextResponse } from 'next/server';
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function POST(request: NextRequest) {
  try {
    const { id, submittedAt } = await request.json();

    const acceptedFile = join(
      process.cwd(),
      'submissions',
      'accepted-tutors.json'
    );

    if (!existsSync(acceptedFile)) {
      return NextResponse.json(
        { success: false, message: 'No tutors file found' },
        { status: 404 }
      );
    }

    const data = await readFile(acceptedFile, 'utf-8');
    const acceptedTutors = JSON.parse(data);

    // Remove the tutor by submittedAt (unique identifier)
    const updatedTutors = acceptedTutors.filter(
      (tutor: any) => tutor.submittedAt !== submittedAt
    );

    await writeFile(acceptedFile, JSON.stringify(updatedTutors, null, 2));

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error deleting tutor:', error);
    return NextResponse.json(
      { success: false, message: 'Error deleting tutor' },
      { status: 500 }
    );
  }
}

