import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../utils/supabase';
import type { SupabaseClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const { submittedAt } = await request.json();

    // If Supabase is not configured, return success (using local JSON files instead)
    if (!supabase) {
      return NextResponse.json(
        { success: true, message: 'Tutor denied (using local storage)' },
        { status: 200 }
      );
    }

    // Mark submission as processed but not accepted
    const supabaseClient = supabase as SupabaseClient<any>;
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
