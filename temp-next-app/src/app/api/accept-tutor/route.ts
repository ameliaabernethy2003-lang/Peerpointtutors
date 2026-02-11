import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../utils/supabase';

export async function POST(request: NextRequest) {
  try {
    const submission = await request.json();

    // If Supabase is not configured, return success (using local JSON files instead)
    if (!supabase) {
      return NextResponse.json(
        { success: true, message: 'Tutor accepted (using local storage)' },
        { status: 200 }
      );
    }

    // Mark submission as processed and accepted in database
    // TypeScript type narrowing: we know supabase is not null after the check above
    const supabaseClient = supabase as any;
    const { error: updateError } = await supabaseClient
      .from('tutor_submissions')
      .update({
        processed: true,
        accepted: true,
      })
      .eq('submitted_at', submission.submittedAt);

    if (updateError) {
      console.error('Error updating submission:', updateError);
      return NextResponse.json(
        { success: false, message: 'Error updating submission' },
        { status: 500 }
      );
    }

    // Parse classes into arrays
    const classesArray = submission.classes
      .split(/[,\n]/)
      .map((c: string) => c.trim())
      .filter((c: string) => c.length > 0);

    // Categorize classes
    const coreCourses: string[] = [];
    const financeCourses: string[] = [];
    const accountingCourses: string[] = [];

    classesArray.forEach((className: string) => {
      const lower = className.toLowerCase();
      if (
        lower.includes('accounting') &&
        !lower.includes('foundations')
      ) {
        accountingCourses.push(className);
      } else if (
        lower.includes('finance') &&
        !lower.includes('foundations')
      ) {
        financeCourses.push(className);
      } else {
        coreCourses.push(className);
      }
    });

    // Save accepted tutor to database
    const { data: tutorData, error: insertError } = await supabaseClient
      .from('accepted_tutors')
      .insert({
        name: `${submission.firstName} ${submission.lastName}`,
        short_label: submission.firstName,
        major: submission.majors,
        role: submission.internshipOrJob || null,
        company: submission.company || null,
        grade: submission.grade,
        rate: submission.rate,
        booking_url: submission.bookingUrl,
        venmo_username: submission.venmoUsername,
        image_src: submission.headshotPath,
        core_courses: coreCourses.length > 0 ? coreCourses : null,
        finance_courses: financeCourses.length > 0 ? financeCourses : null,
        accounting_courses: accountingCourses.length > 0 ? accountingCourses : null,
        extracurriculars: submission.extracurriculars || null,
        college: submission.college,
        school: submission.college.includes('Notre Dame') ? 'University of Notre Dame' : 'Indiana University',
        submitted_at: submission.submittedAt,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error saving accepted tutor:', insertError);
      return NextResponse.json(
        { success: false, message: 'Error saving accepted tutor' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, tutorData },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error accepting tutor:', error);
    return NextResponse.json(
      { success: false, message: 'Error accepting tutor' },
      { status: 500 }
    );
  }
}
