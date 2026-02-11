'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function TutorSignupPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    headshot: null as File | null,
    internshipOrJob: '',
    company: '',
    grade: '',
    college: '',
    majors: '',
    contactInformation: '',
    meetingPreference: '',
    bookingUrl: '',
    venmoUsername: '',
    classes: '',
    extracurriculars: '',
    rate: '',
    calendarShared: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData((prev) => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData((prev) => ({ ...prev, headshot: e.target.files![0] }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.calendarShared) {
      alert('Please confirm that you have shared your calendar with peerpointtutors@gmail.com.');
      return;
    }
    
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const formDataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'headshot' && value instanceof File) {
          formDataToSend.append('headshot', value);
        } else if (key !== 'headshot') {
          formDataToSend.append(key, value === true ? 'true' : value === false ? 'false' : (value as string));
        }
      });

      const response = await fetch('/api/tutor-signup', {
        method: 'POST',
        body: formDataToSend,
      });

      if (response.ok) {
        setSubmitStatus('success');
        setFormData({
          firstName: '',
          lastName: '',
          headshot: null,
          internshipOrJob: '',
          company: '',
          grade: '',
          college: '',
          majors: '',
          contactInformation: '',
          meetingPreference: '',
          bookingUrl: '',
          venmoUsername: '',
          classes: '',
          extracurriculars: '',
          rate: '',
          calendarShared: false,
        });
      } else {
        setSubmitStatus('error');
      }
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-neutral-200 bg-white px-8 py-5 md:px-16">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-900 text-[10px] font-semibold text-white">
              PPT
            </div>
            <span className="text-sm font-semibold uppercase tracking-[0.25em] text-neutral-600">
              PeerPointTutors
            </span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-3xl px-6 py-12 md:px-16">
        {/* Image Space */}
        <div className="mb-8 flex justify-center">
          <div className="w-full max-w-2xl">
            <img
              src="/Pictureforform.png"
              alt="Tutor Signup"
              className="w-full h-auto rounded-lg"
            />
          </div>
        </div>

        <div className="mb-8">
          <h1 className="mb-3 text-3xl font-semibold text-neutral-900">
            Become a Tutor
          </h1>
          <p className="text-sm text-neutral-600">
            Join our peer-to-peer tutoring platform. Fill out the form below to
            apply as a tutor.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name Fields */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label
                htmlFor="firstName"
                className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-neutral-700"
              >
                First Name *
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                required
                className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
                placeholder="Enter your first name"
              />
            </div>
            <div>
              <label
                htmlFor="lastName"
                className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-neutral-700"
              >
                Last Name *
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                required
                className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
                placeholder="Enter your last name"
              />
            </div>
          </div>

          {/* Headshot Upload */}
          <div>
            <label
              htmlFor="headshot"
              className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-neutral-700"
            >
              Headshot Photo *
            </label>
            <input
              type="file"
              id="headshot"
              name="headshot"
              accept="image/*"
              onChange={handleFileChange}
              required
              className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-sm text-neutral-900 file:mr-4 file:rounded-md file:border-0 file:bg-neutral-900 file:px-4 file:py-2 file:text-xs file:font-semibold file:text-white file:hover:bg-black"
            />
            <p className="mt-1 text-xs text-neutral-500">
              Please upload a professional headshot photo
            </p>
          </div>

          {/* Grade */}
          <div>
            <label
              htmlFor="grade"
              className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-neutral-700"
            >
              Grade *
            </label>
            <select
              id="grade"
              name="grade"
              value={formData.grade}
              onChange={handleInputChange}
              required
              className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-sm text-neutral-900 outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
            >
              <option value="">Select your grade</option>
              <option value="Freshman">Freshman</option>
              <option value="Sophomore">Sophomore</option>
              <option value="Junior">Junior</option>
              <option value="Senior">Senior</option>
            </select>
          </div>

          {/* College */}
          <div>
            <label
              htmlFor="college"
              className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-neutral-700"
            >
              College *
            </label>
            <select
              id="college"
              name="college"
              value={formData.college}
              onChange={handleInputChange}
              required
              className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-sm text-neutral-900 outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
            >
              <option value="">Select your college</option>
              <option value="Mendoza College of Business">
                Mendoza College of Business
              </option>
              <option value="College of Science">College of Science</option>
              <option value="College of Engineering">College of Engineering</option>
              <option value="College of Arts & Letters">
                College of Arts & Letters
              </option>
              <option value="School of Architecture">
                School of Architecture
              </option>
              <option value="Keough School of Global Affairs">
                Keough School of Global Affairs
              </option>
            </select>
          </div>

          {/* Majors */}
          <div>
            <label
              htmlFor="majors"
              className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-neutral-700"
            >
              Major(s) *
            </label>
            <textarea
              id="majors"
              name="majors"
              value={formData.majors}
              onChange={handleInputChange}
              required
              rows={3}
              className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
              placeholder="e.g., Finance & Spanish, Accounting, Computer Science..."
            />
            <p className="mt-1 text-xs text-neutral-500">
              List all of your majors and minors
            </p>
          </div>

          {/* Contact Information */}
          <div>
            <label
              htmlFor="contactInformation"
              className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-neutral-700"
            >
              Email *
            </label>
            <input
              type="email"
              id="contactInformation"
              name="contactInformation"
              value={formData.contactInformation}
              onChange={handleInputChange}
              required
              className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
              placeholder="email@example.com"
            />
            <p className="mt-1 text-xs text-neutral-500">
              The email you provide will be the email associated with your Google Calendar that you will make available for booking purposes.
            </p>
          </div>

          {/* Meeting Preference */}
          <div>
            <label
              htmlFor="meetingPreference"
              className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-neutral-700"
            >
              Meeting Preference *
            </label>
            <select
              id="meetingPreference"
              name="meetingPreference"
              value={formData.meetingPreference}
              onChange={handleInputChange}
              required
              className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-sm text-neutral-900 outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
            >
              <option value="">Select meeting preference</option>
              <option value="In Person">In Person</option>
              <option value="Zoom">Zoom</option>
              <option value="Both">Both</option>
            </select>
          </div>

          {/* Google Calendar booking link */}
          <div>
            <label
              htmlFor="bookingUrl"
              className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-neutral-700"
            >
              Google Calendar Booking Link *
            </label>
            <input
              type="url"
              id="bookingUrl"
              name="bookingUrl"
              value={formData.bookingUrl}
              onChange={handleInputChange}
              required
              className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
              placeholder="Paste your Google Calendar appointment schedule link"
            />
            <div className="mt-3 rounded-lg border border-neutral-200 bg-neutral-50 p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-neutral-700">
                How to Create Your Google Calendar Booking Link:
              </p>
              <ol className="space-y-2 text-xs text-neutral-700">
                <li className="flex gap-2">
                  <span className="font-semibold text-neutral-900">1.</span>
                  <span>Go to your personal <span className="font-medium">Google Calendar</span></span>
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold text-neutral-900">2.</span>
                  <span>Click <span className="font-medium">Create</span> (top left)</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold text-neutral-900">3.</span>
                  <span>Select <span className="font-medium">Appointment Schedule</span></span>
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold text-neutral-900">4.</span>
                  <span>Fill out the form:</span>
                </li>
                <li className="ml-6 flex gap-2">
                  <span className="font-semibold text-neutral-900">•</span>
                  <span>Title it: <span className="font-medium">YOUR NAME [TUTOR SESSION]</span></span>
                </li>
                <li className="ml-6 flex gap-2">
                  <span className="font-semibold text-neutral-900">•</span>
                  <span>Set duration to <span className="font-medium">1 hour</span></span>
                </li>
                <li className="ml-6 flex gap-2">
                  <span className="font-semibold text-neutral-900">•</span>
                  <span>Set your <span className="font-medium">weekly availability</span></span>
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold text-neutral-900">5.</span>
                  <span>Click <span className="font-medium">Next</span> (bottom right)</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold text-neutral-900">6.</span>
                  <span>In the description, put:</span>
                </li>
                <li className="ml-6 flex gap-2">
                  <span className="font-semibold text-neutral-900">•</span>
                  <span>Link to your personal <span className="font-medium">Zoom meeting room</span> OR</span>
                </li>
                <li className="ml-6 flex gap-2">
                  <span className="font-semibold text-neutral-900">•</span>
                  <span>An <span className="font-medium">in-person location</span> where you will meet</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold text-neutral-900">7.</span>
                  <span>Booking form must include (add as custom items):</span>
                </li>
                <li className="ml-6 flex gap-2">
                  <span className="font-semibold text-neutral-900">•</span>
                  <span><span className="font-medium">First name</span></span>
                </li>
                <li className="ml-6 flex gap-2">
                  <span className="font-semibold text-neutral-900">•</span>
                  <span><span className="font-medium">Last name</span></span>
                </li>
                <li className="ml-6 flex gap-2">
                  <span className="font-semibold text-neutral-900">•</span>
                  <span><span className="font-medium">Email address</span></span>
                </li>
                <li className="ml-6 flex gap-2">
                  <span className="font-semibold text-neutral-900">•</span>
                  <span><span className="font-medium">Description</span> of what class you need help with</span>
                </li>
                <li className="ml-6 flex gap-2">
                  <span className="font-semibold text-neutral-900">•</span>
                  <span>What you <span className="font-medium">specifically want to work on</span></span>
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold text-neutral-900">8.</span>
                  <span>Click <span className="font-medium">Enter</span> and <span className="font-medium">copy the booking link</span> into the field above</span>
                </li>
              </ol>
            </div>
          </div>

          {/* Calendar Sharing Instructions */}
          <div className="mt-6 rounded-lg border-2 border-blue-200 bg-blue-50 p-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">
              ⚠️ Important: Share Your Calendar
            </p>
            <p className="mb-3 text-xs text-blue-800">
              To enable appointment management and cancellation, you must share your calendar with peerpointtutors@gmail.com.
            </p>
            
            <div className="mb-3 rounded bg-white p-3">
              <p className="mb-2 text-xs font-semibold text-blue-900">Email to Share With:</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 rounded bg-blue-100 px-2 py-1 text-xs font-mono text-blue-900 break-all">
                  peerpointtutors@gmail.com
                </code>
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText('peerpointtutors@gmail.com');
                      alert('Email copied to clipboard!');
                    } catch (e) {
                      console.error('Failed to copy:', e);
                    }
                  }}
                  className="shrink-0 rounded border border-blue-300 bg-white px-2 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-50 transition"
                >
                  Copy
                </button>
              </div>
            </div>

            <p className="mb-2 text-xs font-semibold text-blue-900">Steps to Share:</p>
            <ol className="mb-3 space-y-1 text-xs text-blue-800">
              <li className="flex gap-2">
                <span className="font-semibold">1.</span>
                <span>Open <a href="https://calendar.google.com" target="_blank" rel="noopener noreferrer" className="font-medium underline">Google Calendar</a></span>
              </li>
              <li className="flex gap-2">
                <span className="font-semibold">2.</span>
                <span>Click <span className="font-medium">Settings</span> (gear icon) → <span className="font-medium">Settings</span></span>
              </li>
              <li className="flex gap-2">
                <span className="font-semibold">3.</span>
                <span>Click <span className="font-medium">Settings for my calendars</span></span>
              </li>
              <li className="flex gap-2">
                <span className="font-semibold">4.</span>
                <span>Click on the calendar you use for appointments</span>
              </li>
              <li className="flex gap-2">
                <span className="font-semibold">5.</span>
                <span>Scroll to <span className="font-medium">Share with specific people</span></span>
              </li>
              <li className="flex gap-2">
                <span className="font-semibold">6.</span>
                <span>Click <span className="font-medium">Add people</span></span>
              </li>
              <li className="flex gap-2">
                <span className="font-semibold">7.</span>
                <span>Paste <span className="font-medium">peerpointtutors@gmail.com</span></span>
              </li>
              <li className="flex gap-2">
                <span className="font-semibold">8.</span>
                <span>Select permission: <span className="font-semibold text-red-600">Make changes to events</span> <span className="text-red-600 font-semibold">(REQUIRED)</span></span>
              </li>
              <li className="flex gap-2">
                <span className="font-semibold">9.</span>
                <span>Click <span className="font-medium">Send</span></span>
              </li>
            </ol>

            <div className="flex items-start gap-2 rounded bg-yellow-50 border border-yellow-200 p-2">
              <input
                type="checkbox"
                id="calendarShared"
                name="calendarShared"
                checked={formData.calendarShared}
                onChange={handleInputChange}
                className="mt-0.5"
                required
              />
              <label htmlFor="calendarShared" className="text-xs text-yellow-900">
                <span className="font-semibold">I confirm</span> that I have shared my appointment calendar with peerpointtutors@gmail.com and granted <span className="font-semibold text-red-600">&quot;Make changes to events&quot;</span> permission.
              </label>
            </div>
          </div>

          {/* Venmo Username */}
          <div>
            <label
              htmlFor="venmoUsername"
              className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-neutral-700"
            >
              Venmo Username *
            </label>
            <input
              type="text"
              id="venmoUsername"
              name="venmoUsername"
              value={formData.venmoUsername}
              onChange={handleInputChange}
              required
              className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
              placeholder="e.g., @yourusername"
            />
            <p className="mt-1 text-xs text-neutral-500">
              If you don't have one, please create one.
            </p>
          </div>

          {/* Internship/Job */}
          <div>
            <label
              htmlFor="internshipOrJob"
              className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-neutral-700"
            >
              Internship or Full-Time Position
            </label>
            <input
              type="text"
              id="internshipOrJob"
              name="internshipOrJob"
              value={formData.internshipOrJob}
              onChange={handleInputChange}
              className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
              placeholder="e.g., Incoming Investment Banking Analyst, Incoming Consultant Intern..."
            />
          </div>

          {/* Company */}
          <div>
            <label
              htmlFor="company"
              className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-neutral-700"
            >
              Company
            </label>
            <input
              type="text"
              id="company"
              name="company"
              value={formData.company}
              onChange={handleInputChange}
              className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
              placeholder="e.g., Goldman Sachs, Deloitte, McKinsey..."
            />
          </div>

          {/* Classes */}
          <div>
            <label
              htmlFor="classes"
              className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-neutral-700"
            >
              Classes You Can Tutor *
            </label>
            <textarea
              id="classes"
              name="classes"
              value={formData.classes}
              onChange={handleInputChange}
              required
              rows={5}
              className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
              placeholder="Foundations of Finance, Organic Chemistry, Discrete Mathematics, Calculus I, General Physics II..."
            />
            <p className="mt-1 text-xs text-neutral-500">
              Please try your best to write out the name of the course that is stated on your Syllabus. You can tutor any class you have taken that you feel very proficient in to tutor and teach another student. Examples: Foundations of Finance, Organic Chemistry, Discrete Mathematics, Calculus I, General Physics II
            </p>
          </div>

          {/* Extracurriculars */}
          <div>
            <label
              htmlFor="extracurriculars"
              className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-neutral-700"
            >
              Extracurricular Activities You Can Mentor
            </label>
            <textarea
              id="extracurriculars"
              name="extracurriculars"
              value={formData.extracurriculars}
              onChange={handleInputChange}
              rows={4}
              className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
              placeholder="e.g., SIBC Slide Help, Investment Club Pitch Help, GMAT Prep, GRE Prep, LSAT Prep, MCAT Studying..."
            />
            <p className="mt-1 text-xs text-neutral-500">
              Be as specific as you can. Include participation in specific school clubs, help studying for standardized tests for graduate school (GMAT, GRE, LSAT, MCAT), etc. Separate each activity with commas.
            </p>
          </div>

          {/* Rate */}
          <div>
            <label
              htmlFor="rate"
              className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-neutral-700"
            >
              Hourly Rate ($) *
            </label>
            <select
              id="rate"
              name="rate"
              value={formData.rate}
              onChange={handleInputChange}
              required
              className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-sm text-neutral-900 outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
            >
              <option value="">Select your hourly rate</option>
              <option value="15">$15/hour</option>
              <option value="20">$20/hour</option>
              <option value="25">$25/hour</option>
              <option value="30">$30/hour</option>
              <option value="35">$35/hour</option>
              <option value="40">$40/hour</option>
              <option value="45">$45/hour</option>
              <option value="50">$50/hour</option>
            </select>
            <p className="mt-1 text-xs text-neutral-500">
              Remember your time is valuable, however the higher you charge you might get less students.
            </p>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-full bg-neutral-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>

          {/* Status Messages */}
          {submitStatus === 'success' && (
            <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800">
              Thank you! Your application has been submitted successfully. We'll
              review it and add you to the platform soon.
            </div>
          )}

          {submitStatus === 'error' && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
              There was an error submitting your application. Please try again
              or contact us directly.
            </div>
          )}

        </form>
      </main>
    </div>
  );
}

