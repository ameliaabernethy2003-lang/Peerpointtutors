import { NextResponse } from 'next/server';
import { readJsonData } from '../../utils/db';

export async function GET() {
  try {
    const acceptedTutors: any[] = await readJsonData('accepted-tutors');

    const tutors = acceptedTutors.map((tutor: any) => ({
      name: tutor.name,
      shortLabel: tutor.shortLabel || tutor.short_label || tutor.name.split(' ')[0],
      major: tutor.major,
      role: tutor.role || '',
      company: tutor.company || '',
      grade: tutor.grade,
      rate: tutor.rate,
      bookingUrl: tutor.bookingUrl || tutor.booking_url,
      venmoUsername: tutor.venmoUsername || tutor.venmo_username,
      imageSrc: tutor.imageSrc || tutor.image_src,
      coreCourses: tutor.coreCourses || tutor.core_courses || undefined,
      financeCourses: tutor.financeCourses || tutor.finance_courses || undefined,
      accountingCourses: tutor.accountingCourses || tutor.accounting_courses || undefined,
      extracurriculars: tutor.extracurriculars,
      college: tutor.college,
      school: tutor.school,
      submittedAt: tutor.submittedAt || tutor.submitted_at,
    }));

    const tutorsByCollege: Record<string, any[]> = {};
    tutors.forEach((tutor: any) => {
      const college = tutor.college || 'Unknown';
      if (!tutorsByCollege[college]) {
        tutorsByCollege[college] = [];
      }
      tutorsByCollege[college].push(tutor);
    });

    return NextResponse.json({ tutors: tutorsByCollege });
  } catch (error) {
    console.error('Error reading dynamic tutors:', error);
    return NextResponse.json({ tutors: {} }, { status: 500 });
  }
}
