import { NextRequest, NextResponse } from 'next/server';
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import { supabase } from '../../utils/supabase';

export async function POST(request: NextRequest) {
  try {
    const { submittedAt } = await request.json();

    // If Supabase is not configured, use local JSON files
    if (!supabase) {
      // Mark submission as processed (denied) in tutor-submissions.json
      const submissionsPath = join(process.cwd(), 'submissions', 'tutor-submissions.json');
      try {
        const content = await readFile(submissionsPath, 'utf-8');
        const submissions = JSON.parse(content);
        const updated = submissions.map((s: any) => {
          if (s.submittedAt === submittedAt) {
            return { ...s, processed: true, accepted: false };
          }
          return s;
        });
        await writeFile(submissionsPath, JSON.stringify(updated, null, 2), 'utf-8');
      } catch (error) {
        console.error('Error updating submissions file:', error);
      }

      return NextResponse.json(
        { success: true, message: 'Tutor denied' },
        { status: 200 }
      );
    }

    // Mark submission as processed but not accepted
    // TypeScript type narrowing: we know supabase is not null after the check above
    const supabaseClient = supabase as any;
    const { error } = await supabaseClient
      .from('tutor_submissions')
      .update({
        processed: true,
        accepted: false,
      })
      .eq('submitted_at', submittedAt);

    if (error) {
      console.error('Error denying tutor:', error);
      return NextResponse.json(
        { success: false, message: 'Error denying tutor' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error denying tutor:', error);
    return NextResponse.json(
      { success: false, message: 'Error denying tutor' },
      { status: 500 }
    );
  }
}
