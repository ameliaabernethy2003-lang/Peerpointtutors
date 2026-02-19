import { NextRequest, NextResponse } from 'next/server';
import { readJsonData, writeJsonData } from '../../utils/db';

export async function POST(request: NextRequest) {
  try {
    const { submittedAt } = await request.json();

    // Mark submission as processed (denied)
    const submissions: any[] = await readJsonData('tutor-submissions');
    const updated = submissions.map((s: any) => {
      if (s.submittedAt === submittedAt) {
        return { ...s, processed: true, accepted: false };
      }
      return s;
    });
    await writeJsonData('tutor-submissions', updated);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error denying tutor:', error);
    return NextResponse.json(
      { success: false, message: 'Error denying tutor' },
      { status: 500 }
    );
  }
}
