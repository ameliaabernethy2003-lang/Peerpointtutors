import { NextRequest, NextResponse } from 'next/server';
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function POST(request: NextRequest) {
  try {
    const { name } = await request.json();

    const removedFile = join(
      process.cwd(),
      'submissions',
      'removed-static-tutors.json'
    );

    if (!existsSync(removedFile)) {
      return NextResponse.json({ success: true }, { status: 200 });
    }

    const data = await readFile(removedFile, 'utf-8');
    let removedTutors: string[] = JSON.parse(data);

    // Remove the tutor name from the removed list
    removedTutors = removedTutors.filter((tutorName) => tutorName !== name);
    await writeFile(removedFile, JSON.stringify(removedTutors, null, 2));

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error restoring static tutor:', error);
    return NextResponse.json(
      { success: false, message: 'Error restoring tutor' },
      { status: 500 }
    );
  }
}

