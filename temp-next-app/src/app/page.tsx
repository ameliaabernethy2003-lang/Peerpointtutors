'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { calculateDisplayRate } from './utils/rateCalculator';

type Step = 'hero' | 'school' | 'nd-colleges' | 'iu-coming-soon' | 'tutors' | 'search-results';

type Tutor = {
  name: string;
  shortLabel: string;
  major: string;
  role: string;
  company: string;
  grade?: string;
  coreCourses?: string[];
  financeCourses?: string[];
  accountingCourses?: string[];
  extracurriculars?: string;
  imageSrc?: string;
  rate?: string;
  bookingUrl?: string;
  venmoUsername?: string;
};

type MendozaTutor = Tutor;

const ND_COLLEGES = [
  'College of Arts & Letters',
  'Mendoza College of Business',
  'College of Science',
  'School of Architecture',
  'College of Engineering',
  'Keough School of Global Affairs',
];

const GOOGLE_CALENDAR_URL = 'https://calendar.google.com';

// Helper function to extract last name for sorting
function getLastName(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  return parts[parts.length - 1] || fullName;
}

const MENDOZA_TUTORS: MendozaTutor[] = [
  {
    name: 'Amelia Abernethy',
    shortLabel: 'Amelia',
    major: 'Finance & Spanish',
    role: 'Incoming Consultant, Restructuring Group',
    company: 'FTI Consulting',
    grade: 'Senior',
    coreCourses: ['Foundations of Finance', 'Foundations of Marketing'],
    financeCourses: ['Corporate Finance', 'Investment Theory', 'Security Analysis'],
    // Make sure this file exists in temp-next-app/public/AmeliaHeadshot.JPG
    imageSrc: '/AmeliaHeadshot.JPG',
  },
  {
    name: 'Sarah Grace Bowyer',
    shortLabel: 'Sarah Grace',
    major: 'Finance, Minor in Real Estate',
    role: 'Incoming Investment Banking Analyst',
    company: 'Evercore (Chicago)',
    grade: 'Senior',
    coreCourses: ['Foundations of Finance', 'Foundations of Marketing', 'Accounting 1', 'Accounting 2'],
    financeCourses: ['Corporate Finance', 'Investment Theory', 'Security Analysis'],
    // Make sure this file exists in temp-next-app/public/SarahGrace_HeadShot.png
    imageSrc: '/SarahGrace_HeadShot.png',
  },
  {
    name: 'Caitlin Bianco',
    shortLabel: 'Caitlin',
    major: 'Finance & Psychology',
    role: 'Incoming Analyst, Asset Management',
    company: 'Goldman Sachs',
    grade: 'Senior',
    coreCourses: ['Foundations of Finance', 'Foundations of Marketing'],
    financeCourses: ['Corporate Finance', 'Investment Theory', 'Security Analysis'],
    imageSrc: '/CaitlinBianco_Headshot.jpeg',
  },
  {
    name: 'Kelsey Casella',
    shortLabel: 'Kelsey',
    major: 'Accounting',
    role: 'Incoming Analyst, Audit',
    company: 'Deloitte',
    grade: 'Senior',
    coreCourses: ['Foundations of Accounting', 'Foundations of Marketing', 'Accounting 1', 'Accounting 2'],
    financeCourses: ['Corporate Finance', 'Investment Theory'],
    accountingCourses: ['Audit and Assurance Services', 'Federal Taxation', 'Accounting 3'],
    imageSrc: '/KelseyCasella_Headshot.jpeg',
  },
  {
    name: 'Caroline Brennan',
    shortLabel: 'Caroline',
    major: 'Finance',
    role: 'Incoming Investment Banking Analyst',
    company: 'BMO',
    grade: 'Senior',
    coreCourses: ['Foundations of Finance', 'Foundations of Marketing'],
    financeCourses: ['Corporate Finance', 'Investment Theory', 'Security Analysis'],
    imageSrc: '/CarolineBrennan_Headshot.jpeg',
  },
  {
    name: 'Alexandra Mazzucco',
    shortLabel: 'Alexandra',
    major: 'Strategic Business Management & Sustainability',
    role: 'Incoming Investor Relations Analyst',
    company: 'Joele Frank',
    grade: 'Senior',
    coreCourses: ['Foundations of Finance', 'Foundations of Marketing'],
    imageSrc: '/AlexandraMazzucco_HeadShot.jpeg',
  },
  {
    name: 'Riley Russo',
    shortLabel: 'Riley',
    major: 'Finance',
    role: 'Incoming Investment Banking Analyst',
    company: 'Goldman Sachs',
    grade: 'Senior',
    coreCourses: ['Foundations of Finance', 'Foundations of Marketing', 'Accounting 1', 'Accounting 2'],
    financeCourses: ['Corporate Finance', 'Investment Theory', 'Security Analysis'],
    imageSrc: '/RileyRusso_HeadShot.jpeg',
  },
  {
    name: 'Zoe Gallup',
    shortLabel: 'Zoe',
    major: 'Finance & Irish Studies',
    role: 'Incoming Investment Banking Analyst, Malpas Scholar',
    company: 'Goldman Sachs',
    grade: 'Senior',
    coreCourses: ['Foundations of Finance', 'Foundations of Marketing', 'Accounting 1', 'Accounting 2'],
    financeCourses: ['Corporate Finance', 'Investment Theory', 'Security Analysis'],
    imageSrc: '/ZoeGallup_HeadShot.jpeg',
  },
  {
    name: 'Christian Leusch',
    shortLabel: 'Christian',
    major: 'Finance, Sociology, and Real Estate',
    role: 'Incoming Analyst, Private Credit',
    company: 'Goldman Sachs',
    grade: 'Junior',
    coreCourses: ['Foundations of Finance', 'Foundations of Marketing', 'Accounting 1', 'Accounting 2'],
    financeCourses: ['Corporate Finance', 'Investment Theory', 'Security Analysis'],
    imageSrc: '/ChristianLeusch_HeadShot.jpeg',
  },
  {
    name: 'Audrey Keeley',
    shortLabel: 'Audrey',
    major: 'Finance & Accounting',
    role: 'Incoming Analyst',
    company: 'McKinsey & Company',
    grade: 'Senior',
    coreCourses: ['Foundations of Finance', 'Foundations of Marketing', 'Accounting 1', 'Accounting 2'],
    financeCourses: ['Corporate Finance', 'Investment Theory', 'Security Analysis'],
    imageSrc: '/Audrey Keeley.jpeg',
  },
  {
    name: 'Laura Ryszkowski',
    shortLabel: 'Laura',
    major: 'Finance, Minor in Real Estate',
    role: 'Incoming Investment Banking Analyst',
    company: 'Lincoln',
    grade: 'Senior',
    coreCourses: ['Foundations of Finance', 'Foundations of Marketing', 'Accounting 1', 'Accounting 2'],
    financeCourses: ['Corporate Finance', 'Investment Theory', 'Security Analysis'],
    imageSrc: '/Laura Ryszkowski.jpeg',
  },
  {
    name: 'Megan Carlson',
    shortLabel: 'Megan',
    major: 'Accounting',
    role: 'Incoming Analyst, Audit',
    company: 'Deloitte',
    grade: 'Senior',
    coreCourses: ['Foundations of Accounting', 'Foundations of Marketing', 'Accounting 1', 'Accounting 2'],
    financeCourses: ['Corporate Finance', 'Investment Theory'],
    accountingCourses: ['Audit and Assurance Services', 'Federal Taxation', 'Accounting 3'],
    imageSrc: '/Megan Carlson. jpeg.jpeg',
  },
  {
    name: 'Katherine Devine',
    shortLabel: 'Katherine',
    major: 'Finance & Arabic',
    role: 'Incoming Investment Banking Analyst',
    company: 'Rothschild & Co',
    grade: 'Senior',
    coreCourses: ['Foundations of Finance', 'Foundations of Marketing', 'Accounting 1', 'Accounting 2'],
    financeCourses: ['Corporate Finance', 'Investment Theory', 'Security Analysis'],
    imageSrc: '/Katherine Devine.jpeg',
  },
  {
    name: 'Jack Kopesky',
    shortLabel: 'Jack',
    major: 'Finance & Chinese',
    role: 'Incoming Analyst',
    company: 'Blackstone',
    grade: 'Senior',
    coreCourses: ['Foundations of Finance', 'Foundations of Marketing', 'Accounting 1', 'Accounting 2'],
    financeCourses: ['Corporate Finance', 'Investment Theory', 'Security Analysis'],
    imageSrc: '/Jack Kopesky.jpeg',
  },
  {
    name: 'Ted Heraty',
    shortLabel: 'Ted',
    major: 'Finance & Philosophy',
    role: 'Incoming Intern',
    company: 'Blackstone',
    grade: 'Junior',
    coreCourses: ['Foundations of Finance', 'Foundations of Marketing', 'Accounting 1', 'Accounting 2'],
    financeCourses: ['Corporate Finance', 'Investment Theory', 'Security Analysis'],
    imageSrc: '/Ted Heraty.jpeg',
  },
  {
    name: 'Clare Lau',
    shortLabel: 'Clare',
    major: 'Finance & Psychology',
    role: 'Incoming Investment Banking Intern',
    company: 'Bank of America',
    grade: 'Junior',
    coreCourses: ['Foundations of Finance', 'Foundations of Marketing', 'Accounting 1', 'Accounting 2'],
    financeCourses: ['Corporate Finance', 'Investment Theory', 'Security Analysis'],
    imageSrc: '/Clare Lau.jpeg',
  },
  {
    name: 'Sia Patel',
    shortLabel: 'Sia',
    major: 'Finance',
    role: 'Incoming Restructuring & Special Situations Summer Analyst',
    company: 'PJT',
    grade: 'Junior',
    coreCourses: ['Foundations of Finance', 'Foundations of Marketing', 'Accounting 1', 'Accounting 2'],
    financeCourses: ['Corporate Finance', 'Investment Theory', 'Security Analysis'],
    imageSrc: '/Sia Patel.jpeg',
  },
  {
    name: 'Silvana Mejia Aristizabal',
    shortLabel: 'Silvana',
    major: 'Business Analytics',
    role: 'Incoming Private Banking Analyst',
    company: 'J.P. Morgan',
    grade: 'Senior',
    coreCourses: ['Foundations of Finance', 'Foundations of Marketing'],
    financeCourses: ['Corporate Finance', 'Investment Theory'],
    imageSrc: '/Silvana Mejia Aristizabal.jpeg',
  },
  {
    name: 'Anna Nicole Pino Miro',
    shortLabel: 'Anna Nicole',
    major: 'Business Analytics',
    role: 'Incoming Associate Consultant Analyst',
    company: 'Simon-Kucher',
    grade: 'Senior',
    coreCourses: ['Foundations of Finance', 'Foundations of Marketing'],
    financeCourses: ['Corporate Finance', 'Investment Theory'],
    imageSrc: '/Anna Nicole Pino Miro.jpeg',
  },
  {
    name: 'Ana Victoria Aycinena',
    shortLabel: 'Ana Victoria',
    major: 'Finance, Psychology and Collaborative',
    role: '',
    company: '',
    grade: 'Senior',
    coreCourses: ['Foundations of Finance', 'Foundations of Marketing', 'Accounting 1', 'Accounting 2'],
    financeCourses: ['Corporate Finance', 'Investment Theory', 'Security Analysis'],
    imageSrc: '/Ana Victoria Aycinena.jpeg',
  },
  {
    name: 'Melani Ly',
    shortLabel: 'Melani',
    major: 'Accounting & Finance',
    role: 'Incoming Investment Banking Intern',
    company: 'SMBC Group',
    grade: 'Junior',
    coreCourses: ['Foundations of Accounting', 'Foundations of Marketing', 'Accounting 1', 'Accounting 2'],
    financeCourses: ['Corporate Finance', 'Investment Theory', 'Security Analysis'],
    accountingCourses: ['Audit and Assurance Services', 'Federal Taxation', 'Accounting 3'],
    imageSrc: '/Melani Ly.jpeg',
  },
  {
    name: 'Jonathan Su',
    shortLabel: 'Jonathan',
    major: 'Finance & ACMS',
    role: 'Incoming Investment Banking Intern',
    company: 'Evercore',
    grade: 'Junior',
    coreCourses: ['Foundations of Finance', 'Foundations of Marketing', 'Accounting 1', 'Accounting 2'],
    financeCourses: ['Corporate Finance', 'Investment Theory', 'Security Analysis'],
    imageSrc: '/Jonathan Su.jpeg',
  },
  {
    name: 'Carter McKenna',
    shortLabel: 'Carter',
    major: 'Finance',
    role: 'Incoming Investment Banking Intern',
    company: 'Citi',
    grade: 'Junior',
    coreCourses: ['Foundations of Finance', 'Foundations of Marketing', 'Accounting 1', 'Accounting 2'],
    financeCourses: ['Corporate Finance', 'Investment Theory', 'Security Analysis'],
    imageSrc: '/Carter McKenna.jpeg',
  },
].sort((a, b) => getLastName(a.name).localeCompare(getLastName(b.name)));

const SCIENCE_TUTORS: Tutor[] = [
  {
    name: 'Elizabeth Fesko',
    shortLabel: 'Elizabeth F.',
    major: 'Neuroscience and Behavior BS and Compassionate Care in Medicine',
    role: 'Incoming Medical Student',
    company: 'Indiana School of Medicine',
    grade: 'Senior',
    imageSrc: '/Elizabeth Fesko.jpeg',
  },
  {
    name: 'Elizabeth Murray',
    shortLabel: 'Elizabeth M.',
    major: 'Neuroscience',
    role: '',
    company: '',
    grade: 'Junior',
    imageSrc: '/Elizabeth Murray.jpeg',
  },
  {
    name: 'Kate Schepke',
    shortLabel: 'Kate',
    major: 'Science Business',
    role: '',
    company: '',
    grade: 'Senior',
    imageSrc: '/Kate Schepke.jpeg',
  },
  {
    name: 'Kathleen Buhrfiend',
    shortLabel: 'Kathleen',
    major: 'Pre-Med',
    role: '',
    company: '',
    grade: 'Senior',
    imageSrc: '/Kathleen Buhrfiend.jpeg',
  },
  {
    name: 'Ania Trzesniowski',
    shortLabel: 'Ania',
    major: 'Economics & Pre Health',
    role: '',
    company: '',
    grade: 'Senior',
    imageSrc: '/Ania Trzesniowski.jpeg',
  },
].sort((a, b) => getLastName(a.name).localeCompare(getLastName(b.name)));

const ARCHITECTURE_TUTORS: Tutor[] = [
  {
    name: 'Maeve Chlystek',
    shortLabel: 'Maeve',
    major: 'Architecture',
    role: '',
    company: '',
    grade: 'Senior',
    imageSrc: '/Maeve Chlystek.jpeg',
  },
].sort((a, b) => getLastName(a.name).localeCompare(getLastName(b.name)));

const ENGINEERING_TUTORS: Tutor[] = [
  {
    name: 'Cate Anderson',
    shortLabel: 'Cate',
    major: 'Computer Science',
    role: 'Incoming Rotational Analyst',
    company: 'Point72',
    grade: 'Senior',
    imageSrc: '/Catherine Anderson.jpeg',
  },
  {
    name: 'Emma Newman',
    shortLabel: 'Emma',
    major: 'Computer Science',
    role: 'Incoming Global Markets Quant Analyst',
    company: 'UBS',
    grade: 'Senior',
    imageSrc: '/Emma Newman.jpeg',
  },
  {
    name: 'Elena Saez',
    shortLabel: 'Elena',
    major: 'Aerospace Engineering',
    role: '',
    company: '',
    grade: 'Senior',
    imageSrc: '/Elena Saez.jpeg',
  },
  {
    name: 'Delaney Burnett',
    shortLabel: 'Delaney',
    major: 'Mechanical Engineering',
    role: '',
    company: '',
    grade: 'Senior',
    imageSrc: '/Delaney Burnett.jpeg',
  },
  {
    name: 'Christian Gabriel',
    shortLabel: 'Christian G.',
    major: 'Chemical & Biomolecular Engineering',
    role: 'Incoming Analyst',
    company: 'Alpha Sights',
    grade: 'Senior',
    imageSrc: '/Christian Gabriel El Azar.jpeg',
  },
  {
    name: 'Ashley Burrow',
    shortLabel: 'Ashley',
    major: 'Chemical & Biomolecular Engineering',
    role: '',
    company: '',
    grade: 'Senior',
    imageSrc: '/Ashley Burrow.jpeg',
  },
  {
    name: 'Sophia Noonan',
    shortLabel: 'Sophia',
    major: 'Computer Science',
    role: '',
    company: '',
    grade: 'Senior',
    imageSrc: '/Sophia Noonan.jpeg',
  },
  {
    name: 'Mary Brusco',
    shortLabel: 'Mary',
    major: 'Computer Science',
    role: 'Incoming Analyst',
    company: 'Goldman Sachs',
    grade: 'Senior',
    imageSrc: '/Mary Brusco.jpeg',
  },
  {
    name: 'Taylor Girard',
    shortLabel: 'Taylor',
    major: 'Mechanical Engineering',
    role: '',
    company: '',
    grade: 'Senior',
    imageSrc: '/Taylor Girard.jpeg',
  },
  {
    name: 'Molly Sullivan',
    shortLabel: 'Molly',
    major: 'Computer Science',
    role: 'Incoming Applied LLM Engineer',
    company: 'NVIDIA',
    grade: 'Senior',
    imageSrc: '/Molly Sullivan.jpeg',
  },
  {
    name: 'Matthew Lee',
    shortLabel: 'Matthew',
    major: 'Computer Science',
    role: '',
    company: '',
    grade: 'Junior',
    imageSrc: '/Matthew Lee.jpeg',
  },
  {
    name: 'Luke Zimmerman',
    shortLabel: 'Luke',
    major: 'Computer Science',
    role: '',
    company: '',
    grade: 'Junior',
    imageSrc: '/Luke Zimmerman.jpeg',
  },
].sort((a, b) => getLastName(a.name).localeCompare(getLastName(b.name)));

const ARTS_LETTERS_TUTORS: Tutor[] = [
  {
    name: 'Jack Theobald',
    shortLabel: 'Jack T.',
    major: 'Political Science and Government',
    role: '',
    company: '',
    grade: 'Senior',
    imageSrc: '/Jack Theobald.jpeg',
  },
  {
    name: 'Ella Trigiani',
    shortLabel: 'Ella',
    major: 'Computer Science',
    role: 'Incoming Associate Consultant Intern',
    company: 'Simon-Kucher',
    grade: 'Junior',
    imageSrc: '/Ella Trigiani.jpeg',
  },
  {
    name: 'María Rodríguez Contreras',
    shortLabel: 'María',
    major: 'Economics and Global Affairs',
    role: 'Incoming Global Markets Analyst',
    company: 'Goldman Sachs',
    grade: 'Senior',
    imageSrc: '/María Rodríguez Contreras.jpeg',
  },
  {
    name: 'Olivia Heldring',
    shortLabel: 'Olivia',
    major: 'Computer Science & Theology',
    role: 'Incoming Consulting Analyst',
    company: 'Deloitte',
    grade: 'Senior',
    imageSrc: '/Olivia Heldring.jpeg',
  },
  {
    name: 'Grace Garcia',
    shortLabel: 'Grace',
    major: 'Economics and Business Analytics',
    role: 'Incoming Investment Banking Analyst',
    company: 'Lincoln',
    grade: 'Senior',
    imageSrc: '/Grace Garcia.jpeg',
  },
].sort((a, b) => getLastName(a.name).localeCompare(getLastName(b.name)));

// Helper function to extract primary major
function getPrimaryMajor(major: string): string {
  // Handle different major formats
  if (major.includes('&')) {
    // For "Finance & Spanish" or "Finance & Psychology", take the first one
    return major.split('&')[0].trim();
  }
  if (major.includes(',')) {
    // For "Finance, Minor in Real Estate", take the part before the comma
    return major.split(',')[0].trim();
  }
  // For simple majors like "Accounting" or "Finance", return as is
  return major;
}

export default function Home() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('hero');
  const [schoolQuery, setSchoolQuery] = useState('');
  const [classSearchQuery, setClassSearchQuery] = useState('');
  const [selectedSchool, setSelectedSchool] = useState<string | null>(null);
  const [selectedCollege, setSelectedCollege] = useState<string | null>(null);
  const [selectedExtracurricular, setSelectedExtracurricular] = useState<string | null>(null);
  const [selectedTutorIndex, setSelectedTutorIndex] = useState<number | null>(null);
  const [searchResults, setSearchResults] = useState<Array<{ tutor: Tutor; college: string; index: number }>>([]);
  const [allTutorsData, setAllTutorsData] = useState<Record<string, Record<string, Tutor[]>>>({});
  const [pendingPaymentSessionId, setPendingPaymentSessionId] = useState<string | null>(null);

  // Fetch all tutors data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/all-tutors');
        if (response.ok) {
          const data = await response.json();
          setAllTutorsData(data.tutors || {});
        }
      } catch (error) {
        console.error('Error fetching tutor data:', error);
      }
    };
    fetchData();
  }, []);

  // Detect when user returns to the site after booking on Google Calendar
  useEffect(() => {
    const handleVisibilityChange = () => {
      // When tab becomes visible again, check for pending payment session
      if (!document.hidden) {
        const pendingSessionId = sessionStorage.getItem('pendingPaymentSessionId');
        if (pendingSessionId) {
          // Small delay to ensure page is fully loaded
          setTimeout(() => {
            window.location.href = `/payment?sessionId=${encodeURIComponent(pendingSessionId)}`;
          }, 500);
        }
      }
    };

    // Also check on page focus (when user switches back to tab)
    const handleFocus = () => {
      const pendingSessionId = sessionStorage.getItem('pendingPaymentSessionId');
      if (pendingSessionId) {
        setTimeout(() => {
          window.location.href = `/payment?sessionId=${encodeURIComponent(pendingSessionId)}`;
        }, 500);
      }
    };

    // Listen for visibility changes
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    // Check immediately on mount (in case they navigated back)
    const pendingSessionId = sessionStorage.getItem('pendingPaymentSessionId');
    if (pendingSessionId) {
      // Only redirect if we're not already on the payment page
      if (!window.location.pathname.includes('/payment')) {
        setTimeout(() => {
          window.location.href = `/payment?sessionId=${encodeURIComponent(pendingSessionId)}`;
        }, 1000);
      }
    }

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const startPayment = async (tutor: Tutor) => {
    if (!tutor.bookingUrl) return;
    try {
      const res = await fetch('/api/payment-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tutorName: tutor.name,
          tutorVenmo: tutor.venmoUsername || '',
          rate: tutor.rate || '',
          bookingUrl: tutor.bookingUrl,
        }),
      });
      if (!res.ok) return;
      const data = await res.json();
      if (!data?.success || !data?.sessionId) return;
      router.push(`/payment?sessionId=${encodeURIComponent(data.sessionId)}`);
    } catch (e) {
      console.error('Error starting payment session:', e);
    }
  };

  const handleViewCalendar = async (tutor: Tutor) => {
    if (!tutor.bookingUrl) return;
    try {
      // Create a payment session first
      const res = await fetch('/api/payment-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tutorName: tutor.name,
          tutorVenmo: tutor.venmoUsername || '',
          rate: tutor.rate || '',
          bookingUrl: tutor.bookingUrl,
        }),
      });
      if (!res.ok) {
        alert('Error creating payment session. Please try again.');
        return;
      }
      const data = await res.json();
      if (!data?.success || !data?.sessionId) {
        alert('Error creating payment session. Please try again.');
        return;
      }
      
      // Store sessionId for after booking
      sessionStorage.setItem('pendingPaymentSessionId', data.sessionId);
      setPendingPaymentSessionId(data.sessionId);
      
      // Open calendar in new tab
      window.open(tutor.bookingUrl, '_blank', 'noopener,noreferrer');
      
      // Don't redirect automatically - show the disclosure button instead
    } catch (e) {
      console.error('Error opening calendar:', e);
      alert('Error opening calendar. Please try again.');
    }
  };

  const handleCompletePayment = () => {
    const sessionId = pendingPaymentSessionId || sessionStorage.getItem('pendingPaymentSessionId');
    if (sessionId) {
      window.location.href = `/payment?sessionId=${encodeURIComponent(sessionId)}`;
    }
  };

  // Helper function to get tutors by college
  const getTutorsByCollege = (college: string): Tutor[] => {
    const school = 'University of Notre Dame';
    const tutors = allTutorsData[school]?.[college] || [];
    return tutors.sort((a, b) => {
      const lastNameA = getLastName(a.name);
      const lastNameB = getLastName(b.name);
      return lastNameA.localeCompare(lastNameB);
    });
  };

  // Helper function to filter tutors by extracurricular activity
  const filterTutorsByExtracurricular = (tutors: Tutor[], activity: string): Tutor[] => {
    if (!activity) return tutors;
    return tutors.filter((tutor) => {
      const extracurriculars = tutor.extracurriculars || '';
      const lowerExtracurriculars = extracurriculars.toLowerCase();
      const lowerActivity = activity.toLowerCase();
      // Check if the activity is mentioned in the extracurriculars string
      return lowerExtracurriculars.includes(lowerActivity);
    });
  };

  // Extracurricular activity options
  const EXTRACURRICULAR_ACTIVITIES = [
    'SIBC Slide Help',
    'Investment Club Pitch Help',
    'MCAT Study Help',
  ];

  // Merge static and dynamic tutors, sorted by last name
  const mergedMendozaTutors = useMemo(() => {
    const tutors = getTutorsByCollege('Mendoza College of Business');
    return selectedExtracurricular 
      ? filterTutorsByExtracurricular(tutors, selectedExtracurricular)
      : tutors;
  }, [allTutorsData, selectedExtracurricular]);

  const mergedScienceTutors = useMemo(() => {
    const tutors = getTutorsByCollege('College of Science');
    return selectedExtracurricular 
      ? filterTutorsByExtracurricular(tutors, selectedExtracurricular)
      : tutors;
  }, [allTutorsData, selectedExtracurricular]);

  const mergedEngineeringTutors = useMemo(() => {
    const tutors = getTutorsByCollege('College of Engineering');
    return selectedExtracurricular 
      ? filterTutorsByExtracurricular(tutors, selectedExtracurricular)
      : tutors;
  }, [allTutorsData, selectedExtracurricular]);

  const mergedArtsLettersTutors = useMemo(() => {
    const tutors = getTutorsByCollege('College of Arts & Letters');
    return selectedExtracurricular 
      ? filterTutorsByExtracurricular(tutors, selectedExtracurricular)
      : tutors;
  }, [allTutorsData, selectedExtracurricular]);

  const mergedArchitectureTutors = useMemo(() => {
    const tutors = getTutorsByCollege('School of Architecture');
    return selectedExtracurricular 
      ? filterTutorsByExtracurricular(tutors, selectedExtracurricular)
      : tutors;
  }, [allTutorsData, selectedExtracurricular]);

  // Selected tutor based on merged arrays
  const selectedMendozaTutor =
    selectedCollege === 'Mendoza College of Business' && selectedTutorIndex !== null
      ? mergedMendozaTutors[selectedTutorIndex] ?? null
      : null;
  const selectedScienceTutor =
    selectedCollege === 'College of Science' && selectedTutorIndex !== null
      ? mergedScienceTutors[selectedTutorIndex] ?? null
      : null;
  const selectedEngineeringTutor =
    selectedCollege === 'College of Engineering' && selectedTutorIndex !== null
      ? mergedEngineeringTutors[selectedTutorIndex] ?? null
      : null;
  const selectedArtsLettersTutor =
    selectedCollege === 'College of Arts & Letters' && selectedTutorIndex !== null
      ? mergedArtsLettersTutors[selectedTutorIndex] ?? null
      : null;
  const selectedArchitectureTutor =
    selectedCollege === 'School of Architecture' && selectedTutorIndex !== null
      ? mergedArchitectureTutors[selectedTutorIndex] ?? null
      : null;

  const filteredSchools = useMemo(() => {
    const SCHOOLS = ['University of Notre Dame', 'Indiana University'];
    if (!schoolQuery.trim()) return SCHOOLS;
    return SCHOOLS.filter((school) =>
      school.toLowerCase().includes(schoolQuery.toLowerCase()),
    );
  }, [schoolQuery]);

  // Search function for classes/activities across all tutors
  useEffect(() => {
    if (!classSearchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const query = classSearchQuery.toLowerCase().trim();
    // Create regex pattern for whole word matching
    const wordBoundaryRegex = new RegExp(`\\b${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    const results: Array<{ tutor: Tutor; college: string; index: number }> = [];

    // Search Mendoza tutors
    mergedMendozaTutors.forEach((tutor, index) => {
      const searchableText = [
        tutor.name,
        tutor.major,
        tutor.role,
        tutor.company,
        ...(tutor.coreCourses || []),
        ...(tutor.financeCourses || []),
        ...(tutor.accountingCourses || []),
      ]
        .join(' ');

      if (wordBoundaryRegex.test(searchableText)) {
        results.push({
          tutor,
          college: 'Mendoza College of Business',
          index,
        });
      }
    });

    // Search Science tutors
    mergedScienceTutors.forEach((tutor, index) => {
      const searchableText = [
        tutor.name,
        tutor.major,
        tutor.role,
        tutor.company,
        ...(tutor.coreCourses || []),
        ...(tutor.financeCourses || []),
        ...(tutor.accountingCourses || []),
      ]
        .join(' ');

      if (wordBoundaryRegex.test(searchableText)) {
        results.push({
          tutor,
          college: 'College of Science',
          index,
        });
      }
    });

    // Search Engineering tutors
    mergedEngineeringTutors.forEach((tutor, index) => {
      const searchableText = [
        tutor.name,
        tutor.major,
        tutor.role,
        tutor.company,
        ...(tutor.coreCourses || []),
        ...(tutor.financeCourses || []),
        ...(tutor.accountingCourses || []),
      ]
        .join(' ');

      if (wordBoundaryRegex.test(searchableText)) {
        results.push({
          tutor,
          college: 'College of Engineering',
          index,
        });
      }
    });

    // Search Arts & Letters tutors
    mergedArtsLettersTutors.forEach((tutor, index) => {
      const searchableText = [
        tutor.name,
        tutor.major,
        tutor.role,
        tutor.company,
        ...(tutor.coreCourses || []),
        ...(tutor.financeCourses || []),
        ...(tutor.accountingCourses || []),
      ]
        .join(' ');

      if (wordBoundaryRegex.test(searchableText)) {
        results.push({
          tutor,
          college: 'College of Arts & Letters',
          index,
        });
      }
    });

    // Search Architecture tutors
    mergedArchitectureTutors.forEach((tutor, index) => {
      const searchableText = [
        tutor.name,
        tutor.major,
        tutor.role,
        tutor.company,
        ...(tutor.coreCourses || []),
        ...(tutor.financeCourses || []),
        ...(tutor.accountingCourses || []),
      ]
        .join(' ');

      if (wordBoundaryRegex.test(searchableText)) {
        results.push({
          tutor,
          college: 'School of Architecture',
          index,
        });
      }
    });

    setSearchResults(results);
  }, [classSearchQuery, mergedMendozaTutors, mergedScienceTutors, mergedEngineeringTutors, mergedArtsLettersTutors, mergedArchitectureTutors]);

  const handleSelectSchool = (school: string) => {
    setSelectedSchool(school);
    setSelectedCollege(null);
    if (school.startsWith('University of Notre Dame')) {
      setStep('nd-colleges');
    } else {
      setStep('iu-coming-soon');
    }
  };

  const handleSelectCollege = (college: string) => {
    setSelectedCollege(college);
    setSelectedTutorIndex(null);
    setStep('tutors');
  };

  const handleSelectExtracurricular = (activity: string | null, college: string) => {
    setSelectedExtracurricular(activity);
    setSelectedCollege(college);
    setSelectedTutorIndex(null);
    setStep('tutors');
  };

  const showBack =
    step === 'school' ||
    step === 'nd-colleges' ||
    step === 'iu-coming-soon' ||
    step === 'tutors' ||
    step === 'search-results';

  const handleSearchResultClick = (college: string, index: number) => {
    setSelectedCollege(college);
    setSelectedTutorIndex(index);
    setStep('tutors');
  };

  return (
    <div className="relative min-h-screen bg-white text-neutral-900">

      {/* Top bar */}
      <header className="relative z-10 flex items-center justify-between border-b border-neutral-200 bg-white/80 px-8 py-5 backdrop-blur-sm md:px-16">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-900 text-[10px] font-semibold text-white">
            P2P
              </div>
          <span className="text-sm font-semibold uppercase tracking-[0.25em] text-neutral-600">
            PeerPointTutors
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden text-xs font-medium uppercase tracking-[0.2em] text-neutral-500 md:block">
            Made for students. By students.
          </div>
          <a
            href="/tutor-signup"
            className="rounded-full border border-neutral-300 bg-white px-4 py-2 text-xs font-semibold text-neutral-700 transition hover:bg-neutral-50 hover:border-neutral-400"
          >
            Become a Tutor
          </a>
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 flex min-h-[calc(100vh-72px)] items-center justify-center px-6 pb-12 pt-4 md:px-16">
        <div
          className={
            step === 'hero'
              ? 'mx-auto flex w-full max-w-7xl flex-col gap-10 md:flex-row md:items-start md:gap-16 lg:gap-20 xl:gap-24'
              : 'mx-auto w-full max-w-3xl'
          }
        >
          {/* Left – messaging (hero only) */}
          {step === 'hero' && (
            <section className="flex-1 md:max-w-2xl lg:max-w-3xl">
              <h1 className="mb-6 text-4xl font-semibold leading-tight tracking-tight md:text-5xl lg:text-6xl">
                Made for students
                <br />
                <span className="text-neutral-900">by students.</span>
              </h1>
              <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
                <p className="text-sm leading-relaxed text-neutral-600 md:text-base lg:text-lg">
                  Tired of crowded study sessions and random online tutors that don&apos;t prepare you for your tests? That&apos;s where PeerPoint comes in.
                </p>
                <p className="text-sm leading-relaxed text-neutral-600 md:text-base lg:text-lg">
                  Choose students who took the same classes with the same professor; they understand the course structure and can help you navigate it effectively.
                </p>
              </div>

              <div className="mb-10 flex flex-wrap items-center gap-6">
                <button
                  onClick={() => setStep('school')}
                  className="group inline-flex items-center justify-center rounded-full bg-neutral-900 px-7 py-3 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-black"
                >
                  Request a Tutor
                  <span className="ml-2 text-base transition-transform group-hover:translate-x-0.5">
                    →
                  </span>
                </button>
                <div className="flex flex-col text-xs text-neutral-500">
                  <span>Trusted by students at Notre Dame &amp; IU.</span>
                  <span>No subscriptions. Pay only when you book.</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-x-8 gap-y-3 text-xs text-neutral-400">
                <span className="uppercase tracking-[0.2em]">Peer-to-peer tutoring</span>
                <span className="h-px w-10 bg-neutral-200" />
                <span>Course-specific expertise</span>
              </div>
            </section>
          )}

          {/* Booking panel */}
          <section className="relative flex-1">
            <div className="pointer-events-none absolute inset-0 rounded-3xl border border-neutral-200 bg-white shadow-[0_18px_40px_rgba(15,23,42,0.08)]" />

            <div className="relative z-10 flex h-full flex-col justify-between rounded-3xl bg-white p-6 md:p-7">
              <div className="flex-1">
                {step === 'hero' && (
                  <div className="flex h-full flex-col items-center justify-center text-center text-sm text-neutral-600">
                    <p>
                      Click <span className="font-semibold">Request a Tutor</span> to
                      start your booking. We&apos;ll ask where you study, then route
                      you to tutors at your college.
                    </p>
            </div>
          )}

                {step === 'school' && (
                  <div className="space-y-5">
                    <h2 className="text-lg font-semibold text-neutral-900">
                      Which school are you at?
                    </h2>
                    <p className="text-sm text-neutral-600">
                      Start typing to find your campus. For now, choose between
                      Notre Dame and IU.
                    </p>
                    <div className="space-y-3">
                      <div className="relative">
                        <input
                          value={schoolQuery}
                          onChange={(e) => setSchoolQuery(e.target.value)}
                          placeholder="Search by school name…"
                          className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
                        />
                      </div>
                      <div className="space-y-2">
                        {filteredSchools.map((school) => (
                          <button
                            key={school}
                            type="button"
                            onClick={() => handleSelectSchool(school)}
                            className="flex w-full items-center justify-between rounded-xl border border-neutral-200 bg-white px-4 py-3 text-left text-sm text-neutral-900 transition hover:border-neutral-900/70 hover:bg-neutral-50"
                          >
                            <div>
                              <div className="font-medium">{school}</div>
                              <div className="text-xs text-neutral-500">
                                {school === 'Indiana University' 
                                  ? 'Coming soon to IU' 
                                  : 'Verified peer tutors on campus'}
                              </div>
                            </div>
                            <span className="text-base text-neutral-400">→</span>
                          </button>
                        ))}
                      </div>
                    </div>
            </div>
          )}

                {step === 'nd-colleges' && (
                  <div className="space-y-5">
                    <div className="space-y-1">
                      <p className="text-xs uppercase tracking-[0.25em] text-neutral-500">
                        University of Notre Dame
                      </p>
                      <h2 className="text-lg font-semibold text-neutral-900">
                        Which college are you booking for?
                      </h2>
              </div>
                    <p className="text-sm text-neutral-600">
                      Choose the college that matches your major. We&apos;ll show you
                      tutors who specialize in those programs.
                    </p>

                    {/* Search by class/activity */}
                    <div className="space-y-2">
                      <label className="block text-xs font-medium text-neutral-700">
                        Or search by specific class/activity
                      </label>
                      <input
                        type="text"
                        value={classSearchQuery}
                        onChange={(e) => {
                          const value = e.target.value;
                          setClassSearchQuery(value);
                          // Only show search results if query is at least 2 characters
                          if (value.trim().length >= 2) {
                            setStep('search-results');
                          } else {
                            setStep('nd-colleges');
                          }
                        }}
                        onKeyDown={(e) => {
                          // Prevent any interference with typing
                          e.stopPropagation();
                        }}
                        placeholder="e.g., Corporate Finance, Neuroscience, Accounting..."
                        className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
                      />
                    </div>

                    {!classSearchQuery.trim() && (
                      <>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                          {ND_COLLEGES.map((college) => (
                            <button
                              key={college}
                              type="button"
                              onClick={() => handleSelectCollege(college)}
                              className="flex h-full flex-col justify-between rounded-2xl border border-neutral-200 bg-white p-4 text-left text-sm text-neutral-900 transition hover:border-neutral-900/70 hover:bg-neutral-50"
                            >
                              <span className="mb-2 font-medium">{college}</span>
                              <span className="text-xs text-neutral-500">
                                View available tutors
                              </span>
                            </button>
                          ))}
                        </div>

                        {/* Extracurriculars section */}
                        <div className="mt-6 space-y-3">
                          <div className="space-y-1">
                            <h3 className="text-sm font-semibold text-neutral-900">
                              Extracurricular Activities
                            </h3>
                            <p className="text-xs text-neutral-600">
                              Need help with specific activities? Select an option below.
                            </p>
                          </div>
                          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                            {EXTRACURRICULAR_ACTIVITIES.map((activity) => {
                              // Count tutors across all colleges for this activity
                              let totalTutors = 0;
                              ND_COLLEGES.forEach((college) => {
                                const tutors = getTutorsByCollege(college);
                                const matchingTutors = filterTutorsByExtracurricular(tutors, activity);
                                totalTutors += matchingTutors.length;
                              });
                              
                              return (
                                <button
                                  key={activity}
                                  type="button"
                                  onClick={() => {
                                    // Find the first college that has tutors for this activity
                                    let foundCollege = null;
                                    for (const college of ND_COLLEGES) {
                                      const tutors = getTutorsByCollege(college);
                                      const matchingTutors = filterTutorsByExtracurricular(tutors, activity);
                                      if (matchingTutors.length > 0) {
                                        foundCollege = college;
                                        break;
                                      }
                                    }
                                    if (foundCollege) {
                                      handleSelectExtracurricular(activity, foundCollege);
                                    } else {
                                      // If no tutors found, go to first college
                                      handleSelectExtracurricular(activity, ND_COLLEGES[0]);
                                    }
                                  }}
                                  className="flex flex-col justify-between rounded-xl border border-neutral-200 bg-white p-4 text-left text-sm text-neutral-900 transition hover:border-neutral-900/70 hover:bg-neutral-50"
                                >
                                  <span className="mb-2 font-medium">{activity}</span>
                                  <span className="text-xs text-neutral-500">
                                    {totalTutors} tutor{totalTutors !== 1 ? 's' : ''} available
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {step === 'iu-coming-soon' && (
                  <div className="space-y-5">
                    <div className="space-y-1">
                      <p className="text-xs uppercase tracking-[0.25em] text-neutral-500">
                        Indiana University
                      </p>
                      <h2 className="text-lg font-semibold text-neutral-900">
                        Coming soon to IU
                      </h2>
                    </div>
                    <p className="text-sm text-neutral-600">
                      We&apos;re finalizing our first cohort of IU tutors. For now,
                      you can explore how the experience will look at Notre Dame.
                    </p>
                    <button
                      type="button"
                      onClick={() =>
                        handleSelectSchool('University of Notre Dame')
                      }
                      className="rounded-full bg-neutral-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-black"
                    >
                      Preview Notre Dame experience
                    </button>
                  </div>
                )}

                {step === 'search-results' && (
                  <div className="space-y-5">
                    <div className="space-y-1">
                      <p className="text-xs uppercase tracking-[0.25em] text-neutral-500">
                        Search Results
                      </p>
                      <h2 className="text-lg font-semibold text-neutral-900">
                        Tutors matching &quot;{classSearchQuery}&quot;
                      </h2>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-xs font-medium text-neutral-700">
                        Search by specific class/activity
                      </label>
                      <input
                        type="text"
                        value={classSearchQuery}
                        onChange={(e) => {
                          const value = e.target.value;
                          setClassSearchQuery(value);
                          // Only show search results if query is at least 2 characters
                          if (value.trim().length >= 2) {
                            setStep('search-results');
                          } else {
                            setStep('nd-colleges');
                          }
                        }}
                        onKeyDown={(e) => {
                          // Prevent any interference with typing
                          e.stopPropagation();
                        }}
                        placeholder="e.g., Corporate Finance, Neuroscience, Accounting..."
                        className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
                        autoFocus
                      />
                    </div>
                    {searchResults.length > 0 ? (
                      <div className="space-y-3">
                        <p className="text-sm text-neutral-600">
                          Found {searchResults.length} tutor{searchResults.length !== 1 ? 's' : ''} matching your search.
                        </p>
                        <div className="space-y-2">
                          {searchResults.map((result, idx) => (
                            <button
                              key={`${result.college}-${result.index}-${idx}`}
                              type="button"
                              onClick={() => handleSearchResultClick(result.college, result.index)}
                              className="flex w-full items-center gap-4 rounded-xl border border-neutral-200 bg-white p-4 text-left transition hover:border-neutral-900/70 hover:bg-neutral-50"
                            >
                              {result.tutor.imageSrc ? (
                                <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-full border-2 border-white bg-white shadow-sm">
                                  <img
                                    src={result.tutor.imageSrc}
                                    alt={result.tutor.name}
                                    className="absolute inset-0 h-full w-full scale-105 object-cover object-center"
                                    style={{
                                      filter: 'brightness(1.1) contrast(1.05)',
                                    }}
                                  />
                                </div>
                              ) : (
                                <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full border border-neutral-300 bg-neutral-100 text-sm font-medium text-neutral-500">
                                  {result.index + 1}
                                </div>
                              )}
                              <div className="flex-1">
                                <div className="font-medium text-neutral-900">
                                  {result.tutor.name}
                                </div>
                                <div className="text-xs text-neutral-500">
                                  {result.college}
                                </div>
                                <div className="mt-1 text-xs text-neutral-600">
                                  {result.tutor.major}
                                  {result.tutor.grade && ` • ${result.tutor.grade}`}
                                </div>
                              </div>
                              <span className="text-base text-neutral-400">→</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-6 text-center">
                        <p className="text-sm text-neutral-600">
                          No tutors found matching &quot;{classSearchQuery}&quot;.
                        </p>
                        <p className="mt-2 text-xs text-neutral-500">
                          Try searching for a class name, major, or activity.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {step === 'tutors' && selectedCollege === 'Mendoza College of Business' && (
                  <div className="space-y-6">
                    <div className="space-y-1">
                      <p className="text-xs uppercase tracking-[0.25em] text-neutral-500">
                        {selectedSchool ?? 'University of Notre Dame'}
                      </p>
                      <h2 className="text-lg font-semibold text-neutral-900">
                        {selectedExtracurricular 
                          ? `${selectedExtracurricular} - Mendoza College of Business`
                          : 'Mendoza College of Business tutors'}
                      </h2>
                    </div>
                    <p className="text-sm text-neutral-600">
                      Choose a tutor from below that aligns with your specific
                      needs and specific classes you are in and use the Google
                      Calendar link to book.
                    </p>

                    <div className="grid grid-cols-4 gap-4">
                      {Array.from({ length: Math.max(20, mergedMendozaTutors.length) }).map((_, index) => {
                        const tutor = mergedMendozaTutors[index];
                        const isSelected = selectedTutorIndex === index;
                        return (
                          <button
                            key={index}
                            type="button"
                            onClick={() => setSelectedTutorIndex(index)}
                            className={`flex flex-col items-center gap-2 rounded-xl px-2 py-3 text-center text-xs transition ${
                              tutor?.imageSrc
                                ? 'border-0 bg-transparent hover:opacity-80'
                                : isSelected
                                ? 'border border-neutral-900 bg-neutral-900 text-white'
                                : 'border border-neutral-200 bg-white text-neutral-700 hover:border-neutral-900/70 hover:bg-neutral-50'
                            }`}
                          >
                            {tutor?.imageSrc ? (
                              <div className="relative h-24 w-24 overflow-hidden rounded-full border-2 border-white bg-white shadow-sm">
                                <img
                                  src={tutor.imageSrc}
                                  alt={tutor.name}
                                  className="absolute inset-0 h-full w-full scale-105 object-cover object-center"
                                  style={{
                                    filter: 'brightness(1.1) contrast(1.05)',
                                  }}
                                />
                              </div>
                            ) : (
                              <div
                                className={`flex h-14 w-14 items-center justify-center rounded-full border text-sm font-medium ${
                                  isSelected
                                    ? 'border-white/40 bg-white/10'
                                    : 'border-neutral-300 bg-neutral-100 text-neutral-500'
                                }`}
                              >
                                {index + 1}
                              </div>
                            )}
                            <div className="flex flex-col items-center">
                              <span className="truncate">
                                {tutor?.name ?? `Tutor ${index + 1}`}
                              </span>
                              {tutor?.grade && tutor?.major && (
                                <span className="text-[10px] text-neutral-500">
                                  {getPrimaryMajor(tutor.major)}/{tutor.grade}
                                  {tutor?.rate && ` • $${calculateDisplayRate(tutor.rate)}/hr`}
                                </span>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-700">
                      {selectedTutorIndex === null || !selectedMendozaTutor ? (
                        <p className="text-neutral-500">
                          Select a tutor bubble above to see their full
                          description and booking link.
                        </p>
                      ) : (
                        <div className="space-y-3">
                          <div>
                            <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">
                              {selectedMendozaTutor.shortLabel}
                            </p>
                            <h3 className="text-base font-semibold text-neutral-900">
                              {selectedMendozaTutor.name}
                            </h3>
                          </div>
                          <div className="space-y-3 rounded-lg border border-neutral-200 bg-white px-3 py-3 text-xs text-neutral-700">
                            <p className="font-medium">
                              {selectedMendozaTutor.major}
                              {selectedMendozaTutor.company
                                ? ` • ${selectedMendozaTutor.role} at ${selectedMendozaTutor.company}`
                                : null}
                            </p>
                            {selectedMendozaTutor.coreCourses ||
                            selectedMendozaTutor.financeCourses ||
                            selectedMendozaTutor.accountingCourses ? (
                              <div className="space-y-1">
                                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
                                  Classes I can tutor
                                </p>
                                <div className="grid grid-cols-1 gap-1 text-[11px] text-neutral-700 sm:grid-cols-2">
                                  {selectedMendozaTutor.coreCourses && (
                                    <div>
                                      <p className="mb-0.5 font-medium text-neutral-600">
                                        Core business
                                      </p>
                                      <ul className="list-disc pl-4">
                                        {selectedMendozaTutor.coreCourses.map(
                                          (course) => (
                                            <li key={course}>{course}</li>
                                          ),
                                        )}
                                      </ul>
                                    </div>
                                  )}
                                  {selectedMendozaTutor.financeCourses && (
                                    <div>
                                      <p className="mb-0.5 font-medium text-neutral-600">
                                        Finance Major Specific Classes
                                      </p>
                                      <ul className="list-disc pl-4">
                                        {selectedMendozaTutor.financeCourses.map(
                                          (course) => (
                                            <li key={course}>{course}</li>
                                          ),
                                        )}
                                      </ul>
                                    </div>
                                  )}
                                  {selectedMendozaTutor.accountingCourses && (
                                    <div>
                                      <p className="mb-0.5 font-medium text-neutral-600">
                                        Accounting Specific Classes
                                      </p>
                                      <ul className="list-disc pl-4">
                                        {selectedMendozaTutor.accountingCourses.map(
                                          (course) => (
                                            <li key={course}>{course}</li>
                                          ),
                                        )}
                                      </ul>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <p className="text-neutral-400">
                                Add a longer description for this tutor here —
                                major, classes, experience, and anything else
                                that matters.
                              </p>
                            )}
                          </div>
                          {selectedMendozaTutor.bookingUrl ? (
                            <div className="space-y-3">
                              <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4">
                                <p className="text-xs font-medium text-neutral-900 mb-2">
                                  How it works:
                                </p>
                                <ol className="text-xs text-neutral-700 space-y-1.5 list-decimal list-inside">
                                  <li>Click "View Calendar & Book" to open the tutor&apos;s calendar</li>
                                  <li>Select an available time slot and complete the booking</li>
                                  <li>After booking, you&apos;ll be redirected to complete payment</li>
                                  <li>An admin will verify your payment and confirm the session</li>
                                </ol>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleViewCalendar(selectedMendozaTutor)}
                                className="w-full inline-flex items-center justify-center rounded-full bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-blue-700"
                              >
                                View Calendar &amp; Book
                              </button>
                              {pendingPaymentSessionId && (
                                <div className="rounded-lg border-2 border-blue-500 bg-blue-50 p-4">
                                  <p className="text-xs font-medium text-blue-900 mb-3 text-center">
                                    ⚠️ Return to this page after you book to pay
                                  </p>
                                  <button
                                    type="button"
                                    onClick={handleCompletePayment}
                                    className="w-full inline-flex items-center justify-center rounded-full bg-green-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-green-700"
                                  >
                                    Go to Payment Page
                                  </button>
                                </div>
                              )}
                              {!pendingPaymentSessionId && (
                                <p className="text-xs text-center text-neutral-500">
                                  After booking, return to this page to complete payment
                                </p>
                              )}
                            </div>
                          ) : (
                            <div className="inline-flex items-center justify-center rounded-full border border-neutral-300 bg-neutral-100 px-4 py-2 text-xs font-semibold text-neutral-500">
                              Booking link not set yet
                            </div>
                          )}
                        </div>
                      )}
                    </div>
            </div>
          )}

                {step === 'tutors' && selectedCollege === 'College of Science' && (
                  <div className="space-y-6">
                    <div className="space-y-1">
                      <p className="text-xs uppercase tracking-[0.25em] text-neutral-500">
                        {selectedSchool ?? 'University of Notre Dame'}
                      </p>
                      <h2 className="text-lg font-semibold text-neutral-900">
                        {selectedExtracurricular 
                          ? `${selectedExtracurricular} - College of Science`
                          : 'College of Science tutors'}
                      </h2>
                    </div>
                    <p className="text-sm text-neutral-600">
                      Choose a tutor from below that aligns with your specific
                      needs and specific classes you are in and use the Google
                      Calendar link to book.
                    </p>

                    <div className="grid grid-cols-4 gap-4">
                      {Array.from({ length: Math.max(20, mergedScienceTutors.length) }).map((_, index) => {
                        const tutor = mergedScienceTutors[index];
                        const isSelected = selectedTutorIndex === index;
                        return (
                          <button
                            key={index}
                            type="button"
                            onClick={() => setSelectedTutorIndex(index)}
                            className={`flex flex-col items-center gap-2 rounded-xl px-2 py-3 text-center text-xs transition ${
                              tutor?.imageSrc
                                ? 'border-0 bg-transparent hover:opacity-80'
                                : isSelected
                                ? 'border border-neutral-900 bg-neutral-900 text-white'
                                : 'border border-neutral-200 bg-white text-neutral-700 hover:border-neutral-900/70 hover:bg-neutral-50'
                            }`}
                          >
                            {tutor?.imageSrc ? (
                              <div className="relative h-24 w-24 overflow-hidden rounded-full border-2 border-white bg-white shadow-sm">
                                <img
                                  src={tutor.imageSrc}
                                  alt={tutor.name}
                                  className="absolute inset-0 h-full w-full scale-105 object-cover object-center"
                                  style={{
                                    filter: 'brightness(1.1) contrast(1.05)',
                                  }}
                                />
                              </div>
                            ) : (
                              <div
                                className={`flex h-14 w-14 items-center justify-center rounded-full border text-sm font-medium ${
                                  isSelected
                                    ? 'border-white/40 bg-white/10'
                                    : 'border-neutral-300 bg-neutral-100 text-neutral-500'
                                }`}
                              >
                                {index + 1}
                              </div>
                            )}
                            <div className="flex flex-col items-center">
                              <span className="truncate">
                                {tutor?.name ?? `Tutor ${index + 1}`}
                              </span>
                              {tutor?.grade && tutor?.major && (
                                <span className="text-[10px] text-neutral-500">
                                  {getPrimaryMajor(tutor.major)}/{tutor.grade}
                                  {tutor?.rate && ` • $${calculateDisplayRate(tutor.rate)}/hr`}
                                </span>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-700">
                      {selectedTutorIndex === null || !selectedScienceTutor ? (
                        <p className="text-neutral-500">
                          Select a tutor bubble above to see their full
                          description and booking link.
                        </p>
                      ) : (
                        <div className="space-y-3">
                          <div>
                            <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">
                              {selectedScienceTutor.shortLabel}
                            </p>
                            <h3 className="text-base font-semibold text-neutral-900">
                              {selectedScienceTutor.name}
                            </h3>
                          </div>
                          <div className="space-y-3 rounded-lg border border-neutral-200 bg-white px-3 py-3 text-xs text-neutral-700">
                            <p className="font-medium">
                              {selectedScienceTutor.major}
                              {selectedScienceTutor.company
                                ? ` • ${selectedScienceTutor.role} at ${selectedScienceTutor.company}`
                                : selectedScienceTutor.role
                                ? ` • ${selectedScienceTutor.role}`
                                : null}
                            </p>
                          </div>
                          {selectedScienceTutor.bookingUrl ? (
                            <div className="space-y-3">
                              <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4">
                                <p className="text-xs font-medium text-neutral-900 mb-2">
                                  How it works:
                                </p>
                                <ol className="text-xs text-neutral-700 space-y-1.5 list-decimal list-inside">
                                  <li>Click "View Calendar & Book" to open the tutor&apos;s calendar</li>
                                  <li>Select an available time slot and complete the booking</li>
                                  <li>After booking, you&apos;ll be redirected to complete payment</li>
                                  <li>An admin will verify your payment and confirm the session</li>
                                </ol>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleViewCalendar(selectedScienceTutor)}
                                className="w-full inline-flex items-center justify-center rounded-full bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-blue-700"
                              >
                                View Calendar &amp; Book
                              </button>
                              {pendingPaymentSessionId && (
                                <div className="rounded-lg border-2 border-blue-500 bg-blue-50 p-4">
                                  <p className="text-xs font-medium text-blue-900 mb-3 text-center">
                                    ⚠️ Return to this page after you book to pay
                                  </p>
                                  <button
                                    type="button"
                                    onClick={handleCompletePayment}
                                    className="w-full inline-flex items-center justify-center rounded-full bg-green-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-green-700"
                                  >
                                    Go to Payment Page
                                  </button>
                                </div>
                              )}
                              {!pendingPaymentSessionId && (
                                <p className="text-xs text-center text-neutral-500">
                                  After booking, return to this page to complete payment
                                </p>
                              )}
                            </div>
                          ) : (
                            <div className="inline-flex items-center justify-center rounded-full border border-neutral-300 bg-neutral-100 px-4 py-2 text-xs font-semibold text-neutral-500">
                              Booking link not set yet
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {step === 'tutors' && selectedCollege === 'College of Engineering' && (
                  <div className="space-y-6">
                    <div className="space-y-1">
                      <p className="text-xs uppercase tracking-[0.25em] text-neutral-500">
                        {selectedSchool ?? 'University of Notre Dame'}
                      </p>
                      <h2 className="text-lg font-semibold text-neutral-900">
                        {selectedExtracurricular 
                          ? `${selectedExtracurricular} - College of Engineering`
                          : 'College of Engineering tutors'}
                      </h2>
                    </div>
                    <p className="text-sm text-neutral-600">
                      Choose a tutor from below that aligns with your specific
                      needs and specific classes you are in and use the Google
                      Calendar link to book.
                    </p>

                    <div className="grid grid-cols-4 gap-4">
                      {Array.from({ length: Math.max(20, mergedEngineeringTutors.length) }).map((_, index) => {
                        const tutor = mergedEngineeringTutors[index];
                        const isSelected = selectedTutorIndex === index;
                        return (
                          <button
                            key={index}
                            type="button"
                            onClick={() => setSelectedTutorIndex(index)}
                            className={`flex flex-col items-center gap-2 rounded-xl px-2 py-3 text-center text-xs transition ${
                              tutor?.imageSrc
                                ? 'border-0 bg-transparent hover:opacity-80'
                                : isSelected
                                ? 'border border-neutral-900 bg-neutral-900 text-white'
                                : 'border border-neutral-200 bg-white text-neutral-700 hover:border-neutral-900/70 hover:bg-neutral-50'
                            }`}
                          >
                            {tutor?.imageSrc ? (
                              <div className="relative h-24 w-24 overflow-hidden rounded-full border-2 border-white bg-white shadow-sm">
                                <img
                                  src={tutor.imageSrc}
                                  alt={tutor.name}
                                  className="absolute inset-0 h-full w-full scale-105 object-cover object-center"
                                  style={{
                                    filter: 'brightness(1.1) contrast(1.05)',
                                  }}
                                />
                              </div>
                            ) : (
                              <div
                                className={`flex h-14 w-14 items-center justify-center rounded-full border text-sm font-medium ${
                                  isSelected
                                    ? 'border-white/40 bg-white/10'
                                    : 'border-neutral-300 bg-neutral-100 text-neutral-500'
                                }`}
                              >
                                {index + 1}
                              </div>
                            )}
                            <div className="flex flex-col items-center">
                              <span className="truncate">
                                {tutor?.name ?? `Tutor ${index + 1}`}
                              </span>
                              {tutor?.grade && tutor?.major && (
                                <span className="text-[10px] text-neutral-500">
                                  {getPrimaryMajor(tutor.major)}/{tutor.grade}
                                  {tutor?.rate && ` • $${calculateDisplayRate(tutor.rate)}/hr`}
                                </span>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-700">
                      {selectedTutorIndex === null || !selectedEngineeringTutor ? (
                        <p className="text-neutral-500">
                          Select a tutor bubble above to see their full
                          description and booking link.
                        </p>
                      ) : (
                        <div className="space-y-3">
                          <div>
                            <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">
                              {selectedEngineeringTutor.shortLabel}
                            </p>
                            <h3 className="text-base font-semibold text-neutral-900">
                              {selectedEngineeringTutor.name}
                            </h3>
                          </div>
                          <div className="space-y-3 rounded-lg border border-neutral-200 bg-white px-3 py-3 text-xs text-neutral-700">
                            <p className="font-medium">
                              {selectedEngineeringTutor.major}
                              {selectedEngineeringTutor.company
                                ? ` • ${selectedEngineeringTutor.role} at ${selectedEngineeringTutor.company}`
                                : selectedEngineeringTutor.role
                                ? ` • ${selectedEngineeringTutor.role}`
                                : null}
                            </p>
                          </div>
                          {selectedEngineeringTutor.bookingUrl ? (
                            <div className="space-y-3">
                              <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4">
                                <p className="text-xs font-medium text-neutral-900 mb-2">
                                  How it works:
                                </p>
                                <ol className="text-xs text-neutral-700 space-y-1.5 list-decimal list-inside">
                                  <li>Click "View Calendar & Book" to open the tutor&apos;s calendar</li>
                                  <li>Select an available time slot and complete the booking</li>
                                  <li>After booking, you&apos;ll be redirected to complete payment</li>
                                  <li>An admin will verify your payment and confirm the session</li>
                                </ol>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleViewCalendar(selectedEngineeringTutor)}
                                className="w-full inline-flex items-center justify-center rounded-full bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-blue-700"
                              >
                                View Calendar &amp; Book
                              </button>
                              {pendingPaymentSessionId && (
                                <div className="rounded-lg border-2 border-blue-500 bg-blue-50 p-4">
                                  <p className="text-xs font-medium text-blue-900 mb-3 text-center">
                                    ⚠️ Return to this page after you book to pay
                                  </p>
                                  <button
                                    type="button"
                                    onClick={handleCompletePayment}
                                    className="w-full inline-flex items-center justify-center rounded-full bg-green-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-green-700"
                                  >
                                    Go to Payment Page
                                  </button>
                                </div>
                              )}
                              {!pendingPaymentSessionId && (
                                <p className="text-xs text-center text-neutral-500">
                                  After booking, return to this page to complete payment
                                </p>
                              )}
                            </div>
                          ) : (
                            <div className="inline-flex items-center justify-center rounded-full border border-neutral-300 bg-neutral-100 px-4 py-2 text-xs font-semibold text-neutral-500">
                              Booking link not set yet
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {step === 'tutors' && selectedCollege === 'College of Arts & Letters' && (
                  <div className="space-y-6">
                    <div className="space-y-1">
                      <p className="text-xs uppercase tracking-[0.25em] text-neutral-500">
                        {selectedSchool ?? 'University of Notre Dame'}
                      </p>
                      <h2 className="text-lg font-semibold text-neutral-900">
                        {selectedExtracurricular 
                          ? `${selectedExtracurricular} - College of Arts & Letters`
                          : 'College of Arts & Letters tutors'}
                      </h2>
                    </div>
                    <p className="text-sm text-neutral-600">
                      Choose a tutor from below that aligns with your specific
                      needs and specific classes you are in and use the Google
                      Calendar link to book.
                    </p>

                    <div className="grid grid-cols-4 gap-4">
                      {Array.from({ length: Math.max(20, mergedArtsLettersTutors.length) }).map((_, index) => {
                        const tutor = mergedArtsLettersTutors[index];
                        const isSelected = selectedTutorIndex === index;
                        return (
                          <button
                            key={index}
                            type="button"
                            onClick={() => setSelectedTutorIndex(index)}
                            className={`flex flex-col items-center gap-2 rounded-xl px-2 py-3 text-center text-xs transition ${
                              tutor?.imageSrc
                                ? 'border-0 bg-transparent hover:opacity-80'
                                : isSelected
                                ? 'border border-neutral-900 bg-neutral-900 text-white'
                                : 'border border-neutral-200 bg-white text-neutral-700 hover:border-neutral-900/70 hover:bg-neutral-50'
                            }`}
                          >
                            {tutor?.imageSrc ? (
                              <div className="relative h-24 w-24 overflow-hidden rounded-full border-2 border-white bg-white shadow-sm">
                                <img
                                  src={tutor.imageSrc}
                                  alt={tutor.name}
                                  className="absolute inset-0 h-full w-full scale-105 object-cover object-center"
                                  style={{
                                    filter: 'brightness(1.1) contrast(1.05)',
                                  }}
                                />
                              </div>
                            ) : (
                              <div
                                className={`flex h-14 w-14 items-center justify-center rounded-full border text-sm font-medium ${
                                  isSelected
                                    ? 'border-white/40 bg-white/10'
                                    : 'border-neutral-300 bg-neutral-100 text-neutral-500'
                                }`}
                              >
                                {index + 1}
                              </div>
                            )}
                            <div className="flex flex-col items-center">
                              <span className="truncate">
                                {tutor?.name ?? `Tutor ${index + 1}`}
                              </span>
                              {tutor?.grade && tutor?.major && (
                                <span className="text-[10px] text-neutral-500">
                                  {getPrimaryMajor(tutor.major)}/{tutor.grade}
                                  {tutor?.rate && ` • $${calculateDisplayRate(tutor.rate)}/hr`}
                                </span>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-700">
                      {selectedTutorIndex === null || !selectedArtsLettersTutor ? (
                        <p className="text-neutral-500">
                          Select a tutor bubble above to see their full
                          description and booking link.
                        </p>
                      ) : (
                        <div className="space-y-3">
                          <div>
                            <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">
                              {selectedArtsLettersTutor.shortLabel}
                            </p>
                            <h3 className="text-base font-semibold text-neutral-900">
                              {selectedArtsLettersTutor.name}
                            </h3>
                          </div>
                          <div className="space-y-3 rounded-lg border border-neutral-200 bg-white px-3 py-3 text-xs text-neutral-700">
                            <p className="font-medium">
                              {selectedArtsLettersTutor.major}
                              {selectedArtsLettersTutor.company
                                ? ` • ${selectedArtsLettersTutor.role} at ${selectedArtsLettersTutor.company}`
                                : selectedArtsLettersTutor.role
                                ? ` • ${selectedArtsLettersTutor.role}`
                                : null}
                            </p>
                          </div>
                          {selectedArtsLettersTutor.bookingUrl ? (
                            <div className="space-y-3">
                              <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4">
                                <p className="text-xs font-medium text-neutral-900 mb-2">
                                  How it works:
                                </p>
                                <ol className="text-xs text-neutral-700 space-y-1.5 list-decimal list-inside">
                                  <li>Click "View Calendar & Book" to open the tutor&apos;s calendar</li>
                                  <li>Select an available time slot and complete the booking</li>
                                  <li>After booking, you&apos;ll be redirected to complete payment</li>
                                  <li>An admin will verify your payment and confirm the session</li>
                                </ol>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleViewCalendar(selectedArtsLettersTutor)}
                                className="w-full inline-flex items-center justify-center rounded-full bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-blue-700"
                              >
                                View Calendar &amp; Book
                              </button>
                              {pendingPaymentSessionId && (
                                <div className="rounded-lg border-2 border-blue-500 bg-blue-50 p-4">
                                  <p className="text-xs font-medium text-blue-900 mb-3 text-center">
                                    ⚠️ Return to this page after you book to pay
                                  </p>
                                  <button
                                    type="button"
                                    onClick={handleCompletePayment}
                                    className="w-full inline-flex items-center justify-center rounded-full bg-green-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-green-700"
                                  >
                                    Go to Payment Page
                                  </button>
                                </div>
                              )}
                              {!pendingPaymentSessionId && (
                                <p className="text-xs text-center text-neutral-500">
                                  After booking, return to this page to complete payment
                                </p>
                              )}
                            </div>
                          ) : (
                            <div className="inline-flex items-center justify-center rounded-full border border-neutral-300 bg-neutral-100 px-4 py-2 text-xs font-semibold text-neutral-500">
                              Booking link not set yet
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {step === 'tutors' && selectedCollege === 'School of Architecture' && (
                  <div className="space-y-6">
                    <div className="space-y-1">
                      <p className="text-xs uppercase tracking-[0.25em] text-neutral-500">
                        {selectedSchool ?? 'University of Notre Dame'}
                      </p>
                      <h2 className="text-lg font-semibold text-neutral-900">
                        {selectedExtracurricular 
                          ? `${selectedExtracurricular} - School of Architecture`
                          : 'School of Architecture tutors'}
                      </h2>
                    </div>
                    <p className="text-sm text-neutral-600">
                      Choose a tutor from below that aligns with your specific
                      needs and specific classes you are in and use the Google
                      Calendar link to book.
                    </p>

                    <div className="grid grid-cols-4 gap-4">
                      {Array.from({ length: Math.max(20, mergedArchitectureTutors.length) }).map((_, index) => {
                        const tutor = mergedArchitectureTutors[index];
                        const isSelected = selectedTutorIndex === index;
                        return (
                          <button
                            key={index}
                            type="button"
                            onClick={() => setSelectedTutorIndex(index)}
                            className={`flex flex-col items-center gap-2 rounded-xl px-2 py-3 text-center text-xs transition ${
                              tutor?.imageSrc
                                ? 'border-0 bg-transparent hover:opacity-80'
                                : isSelected
                                ? 'border border-neutral-900 bg-neutral-900 text-white'
                                : 'border border-neutral-200 bg-white text-neutral-700 hover:border-neutral-900/70 hover:bg-neutral-50'
                            }`}
                          >
                            {tutor?.imageSrc ? (
                              <div className="relative h-24 w-24 overflow-hidden rounded-full border-2 border-white bg-white shadow-sm">
                                <img
                                  src={tutor.imageSrc}
                                  alt={tutor.name}
                                  className="absolute inset-0 h-full w-full scale-105 object-cover object-center"
                                  style={{
                                    filter: 'brightness(1.1) contrast(1.05)',
                                  }}
                                />
                              </div>
                            ) : (
                              <div
                                className={`flex h-14 w-14 items-center justify-center rounded-full border text-sm font-medium ${
                                  isSelected
                                    ? 'border-white/40 bg-white/10'
                                    : 'border-neutral-300 bg-neutral-100 text-neutral-500'
                                }`}
                              >
                                {index + 1}
                              </div>
                            )}
                            <div className="flex flex-col items-center">
                              <span className="truncate">
                                {tutor?.name ?? `Tutor ${index + 1}`}
                              </span>
                              {tutor?.grade && tutor?.major && (
                                <span className="text-[10px] text-neutral-500">
                                  {getPrimaryMajor(tutor.major)}/{tutor.grade}
                                  {tutor?.rate && ` • $${calculateDisplayRate(tutor.rate)}/hr`}
                                </span>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-700">
                      {selectedTutorIndex === null || !selectedArchitectureTutor ? (
                        <p className="text-neutral-500">
                          Select a tutor bubble above to see their full
                          description and booking link.
                        </p>
                      ) : (
                        <div className="space-y-3">
                          <div>
                            <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">
                              {selectedArchitectureTutor.shortLabel}
                            </p>
                            <h3 className="text-base font-semibold text-neutral-900">
                              {selectedArchitectureTutor.name}
                            </h3>
                          </div>
                          <div className="space-y-3 rounded-lg border border-neutral-200 bg-white px-3 py-3 text-xs text-neutral-700">
                            <p className="font-medium">
                              {selectedArchitectureTutor.major}
                              {selectedArchitectureTutor.company
                                ? ` • ${selectedArchitectureTutor.role} at ${selectedArchitectureTutor.company}`
                                : selectedArchitectureTutor.role
                                ? ` • ${selectedArchitectureTutor.role}`
                                : null}
                            </p>
                          </div>
                          {selectedArchitectureTutor.bookingUrl ? (
                            <div className="space-y-3">
                              <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4">
                                <p className="text-xs font-medium text-neutral-900 mb-2">
                                  How it works:
                                </p>
                                <ol className="text-xs text-neutral-700 space-y-1.5 list-decimal list-inside">
                                  <li>Click "View Calendar & Book" to open the tutor&apos;s calendar</li>
                                  <li>Select an available time slot and complete the booking</li>
                                  <li>After booking, you&apos;ll be redirected to complete payment</li>
                                  <li>An admin will verify your payment and confirm the session</li>
                                </ol>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleViewCalendar(selectedArchitectureTutor)}
                                className="w-full inline-flex items-center justify-center rounded-full bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-blue-700"
                              >
                                View Calendar &amp; Book
                              </button>
                              {pendingPaymentSessionId && (
                                <div className="rounded-lg border-2 border-blue-500 bg-blue-50 p-4">
                                  <p className="text-xs font-medium text-blue-900 mb-3 text-center">
                                    ⚠️ Return to this page after you book to pay
                                  </p>
                                  <button
                                    type="button"
                                    onClick={handleCompletePayment}
                                    className="w-full inline-flex items-center justify-center rounded-full bg-green-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-green-700"
                                  >
                                    Go to Payment Page
                                  </button>
                                </div>
                              )}
                              {!pendingPaymentSessionId && (
                                <p className="text-xs text-center text-neutral-500">
                                  After booking, return to this page to complete payment
                                </p>
                              )}
                            </div>
                          ) : (
                            <div className="inline-flex items-center justify-center rounded-full border border-neutral-300 bg-neutral-100 px-4 py-2 text-xs font-semibold text-neutral-500">
                              Booking link not set yet
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {step === 'tutors' && selectedCollege !== 'Mendoza College of Business' && selectedCollege !== 'College of Science' && selectedCollege !== 'College of Engineering' && selectedCollege !== 'College of Arts & Letters' && selectedCollege !== 'School of Architecture' && (
                  <div className="space-y-5">
                    <div className="space-y-1">
                      <p className="text-xs uppercase tracking-[0.25em] text-neutral-500">
                        {selectedSchool ?? 'University of Notre Dame'}
                      </p>
                      <h2 className="text-lg font-semibold text-neutral-900">
                        Tutors for{' '}
                        <span className="text-neutral-500">
                          {selectedCollege ?? 'your college'}
                        </span>
                      </h2>
                    </div>
                    <p className="text-sm text-neutral-600">
                      This is where we&apos;ll list individual tutors, along with
                      their majors, courses, rates, and availability. Share your
                      tutor details and we&apos;ll wire them up here.
                    </p>
                    <div className="space-y-3 rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 p-4 text-xs text-neutral-700">
                      <div className="font-semibold">
                        Tutor list placeholder
                      </div>
                      <p>
                        We can add cards for each tutor with their headshot,
                        bio, courses covered, hourly rate, and a{" "}
                        <span className="font-semibold">Request Session</span>{' '}
                        button that connects to your booking workflow (email,
                        form, or payments).
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 flex items-center justify-between text-[11px] text-neutral-400">
                {showBack ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (step === 'school') {
                        setStep('hero');
                      } else if (step === 'nd-colleges' || step === 'iu-coming-soon') {
                        setStep('school');
                      } else if (step === 'search-results') {
                        setClassSearchQuery('');
                        setStep('nd-colleges');
                      } else if (step === 'tutors') {
                        setStep('nd-colleges');
                        setSelectedCollege(null);
                        setSelectedTutorIndex(null);
                        setSelectedExtracurricular(null);
                      }
                    }}
                    className="inline-flex items-center gap-1 text-neutral-500 hover:text-neutral-800"
                  >
                    <span className="text-base leading-none">←</span>
                    <span>Back</span>
                  </button>
                ) : (
                  <span />
                )}

                <span className="text-neutral-400">
                  Built for fast, focused booking — no distractions.
                </span>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Footer with Contact Information */}
      <footer className="border-t border-neutral-200 bg-white px-8 py-6 md:px-16">
        <div className="mx-auto max-w-7xl">
          <p className="text-center text-sm text-neutral-600">
            For any inquiries or questions, email{' '}
            <a 
              href="mailto:peerpointtutors@gmail.com" 
              className="font-medium text-neutral-900 hover:underline"
            >
              peerpointtutors@gmail.com
            </a>
            {' '}or call/text{' '}
            <a 
              href="tel:4158158899" 
              className="font-medium text-neutral-900 hover:underline"
            >
              415-815-8899
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
