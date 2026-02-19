import { NextRequest, NextResponse } from 'next/server';
import { readJsonData, writeJsonData } from '../../utils/db';

export async function POST(request: NextRequest) {
  try {
    const tutorData = await request.json();
    const { id, submittedAt, source, ...updatedFields } = tutorData;

    if (source === 'static') {
      // For static tutors, store override
      const overrides: Record<string, any> = await readJsonData('tutor-overrides') || {};
      
      // If it's an array (empty default), convert to object
      const overridesObj = Array.isArray(overrides) ? {} : overrides;

      overridesObj[id] = {
        ...overridesObj[id],
        ...updatedFields,
        updated_at: new Date().toISOString(),
      };

      await writeJsonData('tutor-overrides', overridesObj);

      return NextResponse.json({ success: true }, { status: 200 });
    } else {
      // For dynamic tutors, update the accepted-tutors list
      const acceptedTutors: any[] = await readJsonData('accepted-tutors');

      const tutorIndex = acceptedTutors.findIndex(
        (tutor: any) => (tutor.submittedAt || tutor.submitted_at) === submittedAt
      );

      if (tutorIndex === -1) {
        return NextResponse.json(
          { success: false, message: 'Tutor not found' },
          { status: 404 }
        );
      }

      acceptedTutors[tutorIndex] = {
        ...acceptedTutors[tutorIndex],
        ...updatedFields,
      };

      await writeJsonData('accepted-tutors', acceptedTutors);

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
