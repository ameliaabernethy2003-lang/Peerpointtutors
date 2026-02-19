import { NextResponse } from 'next/server';
import { readJsonData } from '../../utils/db';

// Static tutors data (same as in page.tsx)
const STATIC_TUTORS = [
  // Mendoza College of Business - Notre Dame
  { name: 'Amelia Abernethy', major: 'Finance & Spanish', grade: 'Senior', college: 'Mendoza College of Business', school: 'University of Notre Dame', imageSrc: '/AmeliaHeadshot.JPG', role: 'Incoming Consultant, Restructuring Group', company: 'FTI Consulting' },
  { name: 'Sarah Grace Bowyer', major: 'Finance, Minor in Real Estate', grade: 'Senior', college: 'Mendoza College of Business', school: 'University of Notre Dame', imageSrc: '/SarahGrace_HeadShot.png', role: 'Incoming Investment Banking Analyst', company: 'Evercore (Chicago)' },
  { name: 'Caitlin Bianco', major: 'Finance & Psychology', grade: 'Senior', college: 'Mendoza College of Business', school: 'University of Notre Dame', imageSrc: '/CaitlinBianco_Headshot.jpeg', role: 'Incoming Analyst, Asset Management', company: 'Goldman Sachs' },
  { name: 'Kelsey Casella', major: 'Accounting', grade: 'Senior', college: 'Mendoza College of Business', school: 'University of Notre Dame', imageSrc: '/KelseyCasella_Headshot.jpeg', role: 'Incoming Analyst, Audit', company: 'Deloitte' },
  { name: 'Caroline Brennan', major: 'Finance', grade: 'Senior', college: 'Mendoza College of Business', school: 'University of Notre Dame', imageSrc: '/CarolineBrennan_Headshot.jpeg', role: 'Incoming Investment Banking Analyst', company: 'BMO' },
  { name: 'Alexandra Mazzucco', major: 'Strategic Business Management & Sustainability', grade: 'Senior', college: 'Mendoza College of Business', school: 'University of Notre Dame', imageSrc: '/AlexandraMazzucco_HeadShot.jpeg', role: 'Incoming Investor Relations Analyst', company: 'Joele Frank' },
  { name: 'Riley Russo', major: 'Finance', grade: 'Senior', college: 'Mendoza College of Business', school: 'University of Notre Dame', imageSrc: '/RileyRusso_HeadShot.jpeg', role: 'Incoming Investment Banking Analyst', company: 'Goldman Sachs' },
  { name: 'Zoe Gallup', major: 'Finance & Irish Studies', grade: 'Senior', college: 'Mendoza College of Business', school: 'University of Notre Dame', imageSrc: '/ZoeGallup_HeadShot.jpeg', role: 'Incoming Investment Banking Analyst, Malpas Scholar', company: 'Goldman Sachs' },
  { name: 'Christian Leusch', major: 'Finance, Sociology, and Real Estate', grade: 'Junior', college: 'Mendoza College of Business', school: 'University of Notre Dame', imageSrc: '/ChristianLeusch_HeadShot.jpeg', role: 'Incoming Analyst, Private Credit', company: 'Goldman Sachs' },
  { name: 'Audrey Keeley', major: 'Finance & Accounting', grade: 'Senior', college: 'Mendoza College of Business', school: 'University of Notre Dame', imageSrc: '/Audrey Keeley.jpeg', role: 'Incoming Analyst', company: 'McKinsey & Company' },
  { name: 'Laura Ryszkowski', major: 'Finance, Minor in Real Estate', grade: 'Senior', college: 'Mendoza College of Business', school: 'University of Notre Dame', imageSrc: '/Laura Ryszkowski.jpeg', role: 'Incoming Investment Banking Analyst', company: 'Lincoln' },
  { name: 'Megan Carlson', major: 'Accounting', grade: 'Senior', college: 'Mendoza College of Business', school: 'University of Notre Dame', imageSrc: '/Megan Carlson. jpeg.jpeg', role: 'Incoming Analyst, Audit', company: 'Deloitte' },
  { name: 'Katherine Devine', major: 'Finance & Arabic', grade: 'Senior', college: 'Mendoza College of Business', school: 'University of Notre Dame', imageSrc: '/Katherine Devine.jpeg', role: 'Incoming Investment Banking Analyst', company: 'Rothschild & Co' },
  { name: 'Jack Kopesky', major: 'Finance & Chinese', grade: 'Senior', college: 'Mendoza College of Business', school: 'University of Notre Dame', imageSrc: '/Jack Kopesky.jpeg', role: 'Incoming Analyst', company: 'Blackstone' },
  { name: 'Ted Heraty', major: 'Finance & Philosophy', grade: 'Junior', college: 'Mendoza College of Business', school: 'University of Notre Dame', imageSrc: '/Ted Heraty.jpeg', role: 'Incoming Intern', company: 'Blackstone' },
  { name: 'Clare Lau', major: 'Finance & Psychology', grade: 'Junior', college: 'Mendoza College of Business', school: 'University of Notre Dame', imageSrc: '/Clare Lau.jpeg', role: 'Incoming Investment Banking Intern', company: 'Bank of America' },
  { name: 'Sia Patel', major: 'Finance', grade: 'Junior', college: 'Mendoza College of Business', school: 'University of Notre Dame', imageSrc: '/Sia Patel.jpeg', role: 'Incoming Restructuring & Special Situations Summer Analyst', company: 'PJT' },
  { name: 'Silvana Mejia Aristizabal', major: 'Business Analytics', grade: 'Senior', college: 'Mendoza College of Business', school: 'University of Notre Dame', imageSrc: '/Silvana Mejia Aristizabal.jpeg', role: 'Incoming Private Banking Analyst', company: 'J.P. Morgan' },
  { name: 'Anna Nicole Pino Miro', major: 'Business Analytics', grade: 'Senior', college: 'Mendoza College of Business', school: 'University of Notre Dame', imageSrc: '/Anna Nicole Pino Miro.jpeg', role: 'Incoming Associate Consultant Analyst', company: 'Simon-Kucher' },
  { name: 'Ana Victoria Aycinena', major: 'Finance, Psychology and Collaborative', grade: 'Senior', college: 'Mendoza College of Business', school: 'University of Notre Dame', imageSrc: '/Ana Victoria Aycinena.jpeg', role: '', company: '' },
  { name: 'Melani Ly', major: 'Accounting & Finance', grade: 'Junior', college: 'Mendoza College of Business', school: 'University of Notre Dame', imageSrc: '/Melani Ly.jpeg', role: 'Incoming Investment Banking Intern', company: 'SMBC Group' },
  { name: 'Jonathan Su', major: 'Finance & ACMS', grade: 'Junior', college: 'Mendoza College of Business', school: 'University of Notre Dame', imageSrc: '/Jonathan Su.jpeg', role: 'Incoming Investment Banking Intern', company: 'Evercore' },
  { name: 'Carter McKenna', major: 'Finance', grade: 'Junior', college: 'Mendoza College of Business', school: 'University of Notre Dame', imageSrc: '/Carter McKenna.jpeg', role: 'Incoming Investment Banking Intern', company: 'Citi' },
  
  // College of Science - Notre Dame
  { name: 'Elizabeth Fesko', major: 'Neuroscience and Behavior BS and Compassionate Care in Medicine', grade: 'Senior', college: 'College of Science', school: 'University of Notre Dame', imageSrc: '/Elizabeth Fesko.jpeg', role: 'Incoming Medical Student', company: 'Indiana School of Medicine' },
  { name: 'Elizabeth Murray', major: 'Neuroscience', grade: 'Junior', college: 'College of Science', school: 'University of Notre Dame', imageSrc: '/Elizabeth Murray.jpeg', role: '', company: '' },
  { name: 'Kate Schepke', major: 'Science Business', grade: 'Senior', college: 'College of Science', school: 'University of Notre Dame', imageSrc: '/Kate Schepke.jpeg', role: '', company: '' },
  { name: 'Kathleen Buhrfiend', major: 'Pre-Med', grade: 'Senior', college: 'College of Science', school: 'University of Notre Dame', imageSrc: '/Kathleen Buhrfiend.jpeg', role: '', company: '' },
  { name: 'Ania Trzesniowski', major: 'Economics & Pre Health', grade: 'Senior', college: 'College of Science', school: 'University of Notre Dame', imageSrc: '/Ania Trzesniowski.jpeg', role: '', company: '' },
  
  // School of Architecture - Notre Dame
  { name: 'Maeve Chlystek', major: 'Architecture', grade: 'Senior', college: 'School of Architecture', school: 'University of Notre Dame', imageSrc: '/Maeve Chlystek.jpeg', role: '', company: '' },
  
  // College of Engineering - Notre Dame
  { name: 'Cate Anderson', major: 'Computer Science', grade: 'Senior', college: 'College of Engineering', school: 'University of Notre Dame', imageSrc: '/Catherine Anderson.jpeg', role: 'Incoming Rotational Analyst', company: 'Point72' },
  { name: 'Emma Newman', major: 'Computer Science', grade: 'Senior', college: 'College of Engineering', school: 'University of Notre Dame', imageSrc: '/Emma Newman.jpeg', role: 'Incoming Global Markets Quant Analyst', company: 'UBS' },
  { name: 'Elena Saez', major: 'Aerospace Engineering', grade: 'Senior', college: 'College of Engineering', school: 'University of Notre Dame', imageSrc: '/Elena Saez.jpeg', role: '', company: '' },
  { name: 'Delaney Burnett', major: 'Mechanical Engineering', grade: 'Senior', college: 'College of Engineering', school: 'University of Notre Dame', imageSrc: '/Delaney Burnett.jpeg', role: '', company: '' },
  { name: 'Christian Gabriel', major: 'Chemical & Biomolecular Engineering', grade: 'Senior', college: 'College of Engineering', school: 'University of Notre Dame', imageSrc: '/Christian Gabriel.jpeg', role: 'Incoming Analyst', company: 'Alpha Sights' },
  { name: 'Ashley Burrow', major: 'Chemical & Biomolecular Engineering', grade: 'Senior', college: 'College of Engineering', school: 'University of Notre Dame', imageSrc: '/Ashley Burrow.jpeg', role: '', company: '' },
  { name: 'Sophia Noonan', major: 'Computer Science', grade: 'Senior', college: 'College of Engineering', school: 'University of Notre Dame', imageSrc: '/Sophia Noonan.jpeg', role: '', company: '' },
  { name: 'Mary Brusco', major: 'Computer Science', grade: 'Senior', college: 'College of Engineering', school: 'University of Notre Dame', imageSrc: '/Mary Brusco.jpeg', role: 'Incoming Analyst', company: 'Goldman Sachs' },
  { name: 'Taylor Girard', major: 'Mechanical Engineering', grade: 'Senior', college: 'College of Engineering', school: 'University of Notre Dame', imageSrc: '/Taylor Girard.jpeg', role: '', company: '' },
  { name: 'Molly Sullivan', major: 'Computer Science', grade: 'Senior', college: 'College of Engineering', school: 'University of Notre Dame', imageSrc: '/Molly Sullivan.jpeg', role: 'Incoming Applied LLM Engineer', company: 'NVIDIA' },
  { name: 'Matthew Lee', major: 'Computer Science', grade: 'Junior', college: 'College of Engineering', school: 'University of Notre Dame', imageSrc: '/Matthew Lee.jpeg', role: '', company: '' },
  { name: 'Luke Zimmerman', major: 'Computer Science', grade: 'Junior', college: 'College of Engineering', school: 'University of Notre Dame', imageSrc: '/Luke Zimmerman.jpeg', role: '', company: '' },
  
  // College of Arts & Letters - Notre Dame
  { name: 'Jack Theobald', major: 'Political Science and Government', grade: 'Senior', college: 'College of Arts & Letters', school: 'University of Notre Dame', imageSrc: '/Jack Theobald.jpeg', role: '', company: '' },
  { name: 'Ella Trigiani', major: 'Computer Science', grade: 'Junior', college: 'College of Arts & Letters', school: 'University of Notre Dame', imageSrc: '/Ella Trigiani.jpeg', role: 'Incoming Associate Consultant Intern', company: 'Simon-Kucher' },
  { name: 'María Rodríguez Contreras', major: 'Economics and Global Affairs', grade: 'Senior', college: 'College of Arts & Letters', school: 'University of Notre Dame', imageSrc: '/María Rodríguez Contreras.jpeg', role: 'Incoming Global Markets Analyst', company: 'Goldman Sachs' },
  { name: 'Olivia Heldring', major: 'Computer Science & Theology', grade: 'Senior', college: 'College of Arts & Letters', school: 'University of Notre Dame', imageSrc: '/Olivia Heldring.jpeg', role: 'Incoming Consulting Analyst', company: 'Deloitte' },
  { name: 'Grace Garcia', major: 'Economics and Business Analytics', grade: 'Senior', college: 'College of Arts & Letters', school: 'University of Notre Dame', imageSrc: '/Grace Garcia.jpeg', role: 'Incoming Investment Banking Analyst', company: 'Lincoln' },
];

export async function GET() {
  try {
    let removedNames = new Set<string>();
    let overrides: Record<string, any> = {};
    let acceptedTutors: any[] = [];

    // Read removed tutors
    try {
      const removedList = await readJsonData('removed-static-tutors');
      removedNames = new Set(Array.isArray(removedList) ? removedList : []);
    } catch {
      // Skip
    }

    // Read tutor overrides
    try {
      const overridesData = await readJsonData('tutor-overrides');
      if (overridesData && typeof overridesData === 'object' && !Array.isArray(overridesData)) {
        Object.assign(overrides, overridesData);
      }
    } catch {
      // Skip
    }

    // Read accepted tutors
    try {
      acceptedTutors = await readJsonData('accepted-tutors');
      if (!Array.isArray(acceptedTutors)) acceptedTutors = [];
    } catch {
      // Skip
    }

    // Transform static tutors with overrides and filter removed ones
    const staticTutors = STATIC_TUTORS
      .filter((tutor) => !removedNames.has(tutor.name))
      .map((tutor) => {
        const tutorId = `static-${tutor.name}`;
        const override = overrides[tutorId] || {};
        return {
          ...tutor,
          ...override,
          shortLabel: override.shortLabel || tutor.name.split(' ')[0],
          id: tutorId,
          source: 'static',
        };
      });

    // Transform accepted tutors
    const dynamicTutors = acceptedTutors.map((tutor: any) => ({
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
      school: 'University of Notre Dame',
      submittedAt: tutor.submittedAt || tutor.submitted_at,
      id: tutor.id || `dynamic-${tutor.name}-${tutor.submittedAt || Date.now()}`,
      source: 'dynamic',
    }));

    // Combine and group by school, then by college
    const allTutors = [...staticTutors, ...dynamicTutors];
    const tutorsBySchoolAndCollege: Record<string, Record<string, any[]>> = {};

    allTutors.forEach((tutor) => {
      const school = tutor.school || 'University of Notre Dame';
      const college = tutor.college || 'Unknown';
      
      if (!tutorsBySchoolAndCollege[school]) {
        tutorsBySchoolAndCollege[school] = {};
      }
      if (!tutorsBySchoolAndCollege[school][college]) {
        tutorsBySchoolAndCollege[school][college] = [];
      }
      tutorsBySchoolAndCollege[school][college].push(tutor);
    });

    return NextResponse.json({ tutors: tutorsBySchoolAndCollege });
  } catch (error) {
    console.error('Error fetching all tutors:', error);
    return NextResponse.json({ tutors: {} }, { status: 500 });
  }
}
