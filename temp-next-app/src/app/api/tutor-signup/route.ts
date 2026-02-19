import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { readJsonData, writeJsonData } from '../../utils/db';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    // Extract form fields
    const firstName = formData.get('firstName') as string;
    const lastName = formData.get('lastName') as string;
    const headshot = formData.get('headshot') as File;
    const internshipOrJob = formData.get('internshipOrJob') as string;
    const company = formData.get('company') as string;
    const grade = formData.get('grade') as string;
    const college = formData.get('college') as string;
    const majors = formData.get('majors') as string;
    const contactInformation = formData.get('contactInformation') as string;
    const meetingPreference = formData.get('meetingPreference') as string;
    const bookingUrl = formData.get('bookingUrl') as string;
    const venmoUsername = formData.get('venmoUsername') as string;
    const classes = formData.get('classes') as string;
    const extracurriculars = formData.get('extracurriculars') as string;
    const rate = formData.get('rate') as string;

    // Save headshot file (still using file system for images)
    let headshotFilename = '';
    let headshotPath = '';
    if (headshot && headshot.size > 0) {
      const bytes = await headshot.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Create public/uploads directory if it doesn't exist
      const uploadsDir = join(process.cwd(), 'public', 'uploads', 'headshots');
      if (!existsSync(uploadsDir)) {
        await mkdir(uploadsDir, { recursive: true });
      }

      // Generate filename
      const fileExtension = headshot.name.split('.').pop();
      headshotFilename = `${firstName}_${lastName}_${Date.now()}.${fileExtension}`;
      const filePath = join(uploadsDir, headshotFilename);
      await writeFile(filePath, buffer);
      headshotPath = `/uploads/headshots/${headshotFilename}`;
    }

    // Read existing submissions
    const submissions: any[] = await readJsonData('tutor-submissions');

    // Create new submission object
    const newSubmission = {
      id: `submission-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
      firstName,
      lastName,
      headshotFilename: headshotFilename || null,
      headshotPath: headshotPath || null,
      internshipOrJob: internshipOrJob || null,
      company: company || null,
      grade,
      college,
      majors,
      contactInformation,
      meetingPreference,
      bookingUrl,
      venmoUsername,
      classes,
      extracurriculars: extracurriculars || null,
      rate,
      submittedAt: new Date().toISOString(),
      processed: false,
    };

    // Add to submissions array and save
    submissions.push(newSubmission);
    await writeJsonData('tutor-submissions', submissions);

    return NextResponse.json(
      { success: true, message: 'Application submitted successfully', submissionId: newSubmission.id },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error processing submission:', error);
    return NextResponse.json(
      { success: false, message: 'Error processing submission' },
      { status: 500 }
    );
  }
}
