import { NextRequest, NextResponse } from 'next/server';
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';

export async function POST(request: NextRequest) {
  try {
    const tutorData = await request.json();
    const { id, submittedAt, source, ...updatedFields } = tutorData;

    if (source === 'static') {
      // For static tutors, store override in JSON file
      const overridesPath = join(process.cwd(), 'submissions', 'tutor-overrides.json');
      
      let overrides: Record<string, any> = {};
      try {
        const fileContent = await readFile(overridesPath, 'utf-8');
        overrides = JSON.parse(fileContent);
      } catch {
        // File doesn't exist, start with empty object
      }

      // Update the override for this tutor
      overrides[id] = {
        ...overrides[id],
        ...updatedFields,
        updated_at: new Date().toISOString(),
      };

      await writeFile(overridesPath, JSON.stringify(overrides, null, 2));

      return NextResponse.json({ success: true }, { status: 200 });
    } else {
      // For dynamic tutors, update the accepted-tutors.json file
      const acceptedPath = join(process.cwd(), 'submissions', 'accepted-tutors.json');
      
      let acceptedTutors: any[] = [];
      try {
        const fileContent = await readFile(acceptedPath, 'utf-8');
        acceptedTutors = JSON.parse(fileContent);
      } catch {
        return NextResponse.json(
          { success: false, message: 'Tutor file not found' },
          { status: 404 }
        );
      }

      // Find and update the tutor by submittedAt
      const tutorIndex = acceptedTutors.findIndex(
        (tutor: any) => (tutor.submittedAt || tutor.submitted_at) === submittedAt
      );

      if (tutorIndex === -1) {
        return NextResponse.json(
          { success: false, message: 'Tutor not found' },
          { status: 404 }
        );
      }

      // Update the tutor
      acceptedTutors[tutorIndex] = {
        ...acceptedTutors[tutorIndex],
        ...updatedFields,
      };

      await writeFile(acceptedPath, JSON.stringify(acceptedTutors, null, 2));

      return NextResponse.json({ success: true }, { status: 200 });
    }
  } catch (error) {
    console.error('Error updating tutor:', error);
    return NextResponse.json(
      { success: false, message: 'Error updating tutor' },
      { status: 500 }
    );
  }
}
