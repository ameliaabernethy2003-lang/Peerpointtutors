import { NextRequest, NextResponse } from 'next/server';
import { readJsonData, writeJsonData } from '../../utils/db';

export async function POST(request: NextRequest) {
  try {
    const { name } = await request.json();

    const removedTutors: string[] = await readJsonData('removed-static-tutors');
    const removedList = Array.isArray(removedTutors) ? removedTutors : [];

    const updatedList = removedList.filter((tutorName) => tutorName !== name);
    await writeJsonData('removed-static-tutors', updatedList);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error restoring static tutor:', error);
    return NextResponse.json(
      { success: false, message: 'Error restoring tutor' },
      { status: 500 }
    );
  }
}
