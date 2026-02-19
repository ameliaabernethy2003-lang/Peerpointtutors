import { NextRequest, NextResponse } from 'next/server';
import { readJsonData, writeJsonData } from '../../utils/db';

export async function POST(request: NextRequest) {
  try {
    const { submittedAt } = await request.json();

    const acceptedTutors: any[] = await readJsonData('accepted-tutors');

    const updatedTutors = acceptedTutors.filter(
      (tutor: any) => tutor.submittedAt !== submittedAt
    );

    await writeJsonData('accepted-tutors', updatedTutors);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error deleting tutor:', error);
    return NextResponse.json(
      { success: false, message: 'Error deleting tutor' },
      { status: 500 }
    );
  }
}
