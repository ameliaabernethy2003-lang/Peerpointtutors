import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir, readFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { supabase } from '../../utils/supabase';
import type { SupabaseClient } from '@supabase/supabase-js';

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

    // Save to Supabase database (if configured) or local JSON file
    if (!supabase) {
      // Use local JSON file storage instead
      const submissionsPath = join(process.cwd(), 'submissions', 'tutor-submissions.json');
      
      // Read existing submissions
      let submissions: any[] = [];
      try {
        if (existsSync(submissionsPath)) {
          const content = await readFile(submissionsPath, 'utf-8');
          submissions = JSON.parse(content);
          if (!Array.isArray(submissions)) {
            submissions = [];
          }
        }
      } catch (error) {
        console.error('Error reading submissions file:', error);
        submissions = [];
      }

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

      // Add to submissions array
      submissions.push(newSubmission);

      // Write back to file
      await writeFile(submissionsPath, JSON.stringify(submissions, null, 2), 'utf-8');

      return NextResponse.json(
        { success: true, message: 'Application submitted successfully', submissionId: newSubmission.id },
        { status: 200 }
      );
    }

    const supabaseClient = supabase as SupabaseClient<any>;
    const { data, error } = await supabaseClient
      .from('tutor_submissions')
      .insert({
        first_name: firstName,
        last_name: lastName,
        headshot_filename: headshotFilename || null,
        headshot_path: headshotPath || null,
        internship_or_job: internshipOrJob || null,
        company: company || null,
        grade: grade,
        college: college,
        majors: majors,
        contact_information: contactInformation,
        meeting_preference: meetingPreference,
        booking_url: bookingUrl,
        venmo_username: venmoUsername,
        classes: classes,
        extracurriculars: extracurriculars || null,
        rate: rate,
        processed: false,
        accepted: false,
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving to Supabase:', error);
      return NextResponse.json(
        { success: false, message: 'Error saving submission to database' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, message: 'Application submitted successfully', submissionId: data.id },
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
