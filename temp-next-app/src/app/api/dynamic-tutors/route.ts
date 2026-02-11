import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';

export async function GET() {
  try {
    // Read accepted tutors from JSON file
    const acceptedPath = join(process.cwd(), 'submissions', 'accepted-tutors.json');
    
    let acceptedTutors: any[] = [];
    try {
      const acceptedContent = await readFile(acceptedPath, 'utf-8');
      acceptedTutors = JSON.parse(acceptedContent);
    } catch {
      // File doesn't exist, return empty
      return NextResponse.json({ tutors: {} });
    }

    // Transform to match expected format
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

    // Group by college
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
