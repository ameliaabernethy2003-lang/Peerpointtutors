import { NextRequest, NextResponse } from 'next/server';
import { readJsonData, writeJsonData } from '../../utils/db';

export async function POST(request: NextRequest) {
  try {
    const submission = await request.json();

    // Parse classes into arrays
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

    // 1. Mark submission as processed in tutor-submissions
    const submissions: any[] = await readJsonData('tutor-submissions');
    const updated = submissions.map((s: any) => {
      if (s.submittedAt === submission.submittedAt || s.id === submission.id) {
        return { ...s, processed: true, accepted: true };
      }
      return s;
    });
    await writeJsonData('tutor-submissions', updated);

    // 2. Add tutor to accepted-tutors
    const acceptedTutors: any[] = await readJsonData('accepted-tutors');

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
      school: (submission.college || '').includes('Notre Dame')
        ? 'University of Notre Dame'
        : 'Indiana University',
      submittedAt: submission.submittedAt,
      contactInformation: submission.contactInformation || '',
    };

    acceptedTutors.push(newTutor);
    await writeJsonData('accepted-tutors', acceptedTutors);

    return NextResponse.json(
      { success: true, message: 'Tutor accepted and added to database', tutorData: newTutor },
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
