import { NextRequest, NextResponse } from 'next/server';
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { supabase } from '../../utils/supabase';

export async function POST(request: NextRequest) {
  try {
    const submission = await request.json();

    // Parse classes into arrays (needed for both Supabase and local storage)
    const classesArray = (submission.classes || '')
      .split(/[,\n]/)
      .map((c: string) => c.trim())
      .filter((c: string) => c.length > 0);

    const coreCourses: string[] = [];
    const financeCourses: string[] = [];
    const accountingCourses: string[] = [];

    classesArray.forEach((className: string) => {
      const lower = className.toLowerCase();
      if (lower.includes('accounting') && !lower.includes('foundations')) {
        accountingCourses.push(className);
      } else if (lower.includes('finance') && !lower.includes('foundations')) {
        financeCourses.push(className);
      } else {
        coreCourses.push(className);
      }
    });

    // If Supabase is not configured, use local JSON files
    if (!supabase) {
      // 1. Mark submission as processed in tutor-submissions.json
      const submissionsPath = join(process.cwd(), 'submissions', 'tutor-submissions.json');
      try {
        const content = await readFile(submissionsPath, 'utf-8');
        const submissions = JSON.parse(content);
        const updated = submissions.map((s: any) => {
          if (s.submittedAt === submission.submittedAt || s.id === submission.id) {
            return { ...s, processed: true, accepted: true };
          }
          return s;
        });
        await writeFile(submissionsPath, JSON.stringify(updated, null, 2), 'utf-8');
      } catch (error) {
        console.error('Error updating submissions file:', error);
      }

      // 2. Add tutor to accepted-tutors.json
      const acceptedPath = join(process.cwd(), 'submissions', 'accepted-tutors.json');
      let acceptedTutors: any[] = [];
      try {
        if (existsSync(acceptedPath)) {
          const content = await readFile(acceptedPath, 'utf-8');
          acceptedTutors = JSON.parse(content);
          if (!Array.isArray(acceptedTutors)) acceptedTutors = [];
        }
      } catch {
        acceptedTutors = [];
      }

      const newTutor = {
        id: `dynamic-${submission.firstName}-${submission.lastName}-${Date.now()}`,
        name: `${submission.firstName} ${submission.lastName}`,
        shortLabel: submission.firstName,
        major: submission.majors,
        role: submission.internshipOrJob || '',
        company: submission.company || '',
        grade: submission.grade,
        rate: submission.rate,
        bookingUrl: submission.bookingUrl || '',
        venmoUsername: submission.venmoUsername || '',
        imageSrc: submission.headshotPath || '',
        coreCourses: coreCourses.length > 0 ? coreCourses : undefined,
        financeCourses: financeCourses.length > 0 ? financeCourses : undefined,
        accountingCourses: accountingCourses.length > 0 ? accountingCourses : undefined,
        extracurriculars: submission.extracurriculars || '',
        college: submission.college,
        school: (submission.college || '').includes('Notre Dame') ? 'University of Notre Dame' : 'Indiana University',
        submittedAt: submission.submittedAt,
        contactInformation: submission.contactInformation || '',
      };

      acceptedTutors.push(newTutor);
      await writeFile(acceptedPath, JSON.stringify(acceptedTutors, null, 2), 'utf-8');

      return NextResponse.json(
        { success: true, message: 'Tutor accepted and added to database', tutorData: newTutor },
        { status: 200 }
      );
    }

    // Mark submission as processed and accepted in Supabase database
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
