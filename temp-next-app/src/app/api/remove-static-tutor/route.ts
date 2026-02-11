import { NextRequest, NextResponse } from 'next/server';
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';

export async function POST(request: NextRequest) {
  try {
    const { name } = await request.json();

    const removedPath = join(process.cwd(), 'submissions', 'removed-static-tutors.json');
    
    let removedTutors: string[] = [];
    try {
      const fileContent = await readFile(removedPath, 'utf-8');
      removedTutors = JSON.parse(fileContent);
    } catch {
      // File doesn't exist, start with empty array
    }

    // Add to removed list if not already there
    if (!removedTutors.includes(name)) {
      removedTutors.push(name);
      await writeFile(removedPath, JSON.stringify(removedTutors, null, 2));
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error removing static tutor:', error);
    return NextResponse.json(
      { success: false, message: 'Error removing tutor' },
      { status: 500 }
    );
  }
}
