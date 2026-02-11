'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

type Submission = {
  firstName: string;
  lastName: string;
  headshotFilename: string;
  headshotPath: string;
  internshipOrJob: string;
  company: string;
  grade: string;
  college: string;
  majors: string;
  classes: string;
  extracurriculars: string;
  submittedAt: string;
};

export default function AdminSubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const response = await fetch('/api/tutor-submissions');
      if (response.ok) {
        const data = await response.json();
        setSubmissions(data);
      }
    } catch (error) {
      console.error('Error fetching submissions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-neutral-600">Loading submissions...</p>
      </div>
    );
  }

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
          <Link
            href="/tutor-signup"
            className="text-xs font-medium text-neutral-600 hover:text-neutral-900"
          >
            View Form →
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-6xl px-6 py-12 md:px-16">
        <div className="mb-8">
          <h1 className="mb-3 text-3xl font-semibold text-neutral-900">
            Tutor Submissions
          </h1>
          <p className="text-sm text-neutral-600">
            Review and manage tutor applications
          </p>
        </div>

        {submissions.length === 0 ? (
          <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-8 text-center">
            <p className="text-sm text-neutral-600">
              No submissions yet. Share the form link to receive applications.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {submissions.map((submission, index) => (
              <div
                key={index}
                className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm"
              >
                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                  {/* Left Column - Photo and Basic Info */}
                  <div className="space-y-4">
                    {submission.headshotPath && (
                      <div className="relative h-32 w-32 overflow-hidden rounded-full border-2 border-neutral-200">
                        <img
                          src={submission.headshotPath}
                          alt={`${submission.firstName} ${submission.lastName}`}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    )}
                    <div>
                      <h3 className="text-lg font-semibold text-neutral-900">
                        {submission.firstName} {submission.lastName}
                      </h3>
                      <p className="text-sm text-neutral-600">
                        {submission.grade} • {submission.college}
                      </p>
                    </div>
                  </div>

                  {/* Middle Column - Details */}
                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="font-medium text-neutral-700">Major(s):</p>
                      <p className="text-neutral-600">{submission.majors}</p>
                    </div>
                    <div>
                      <p className="font-medium text-neutral-700">
                        Position:
                      </p>
                      <p className="text-neutral-600">
                        {submission.internshipOrJob} at {submission.company}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium text-neutral-700">
                        Submitted:
                      </p>
                      <p className="text-neutral-600">
                        {new Date(submission.submittedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Right Column - Classes and Activities */}
                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="font-medium text-neutral-700">
                        Classes to Tutor:
                      </p>
                      <p className="text-neutral-600 whitespace-pre-line">
                        {submission.classes}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium text-neutral-700">
                        Extracurriculars:
                      </p>
                      <p className="text-neutral-600 whitespace-pre-line">
                        {submission.extracurriculars}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

