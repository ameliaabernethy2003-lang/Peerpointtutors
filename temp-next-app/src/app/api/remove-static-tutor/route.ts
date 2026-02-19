import { NextRequest, NextResponse } from 'next/server';
import { readJsonData, writeJsonData } from '../../utils/db';

export async function POST(request: NextRequest) {
  try {
    const { name } = await request.json();

    const removedTutors: string[] = await readJsonData('removed-static-tutors');
    const removedList = Array.isArray(removedTutors) ? removedTutors : [];

    if (!removedList.includes(name)) {
      removedList.push(name);
      await writeJsonData('removed-static-tutors', removedList);
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
