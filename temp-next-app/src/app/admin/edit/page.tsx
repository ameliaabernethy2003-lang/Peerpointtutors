'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { calculateDisplayRate } from '../../utils/rateCalculator';

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
  contactInformation: string;
  meetingPreference: string;
  classes: string;
  extracurriculars: string;
  rate: string;
  submittedAt: string;
  id?: string;
  processed?: boolean;
};

const ADMIN_PASSWORD = 'admin'; // Change this to your desired admin password
const ADMIN_VENMO_USERNAME = 'peerpointtutors'; // Admin's Venmo username - make sure you're logged into Venmo with this account when paying tutors

type Tutor = {
  name: string;
  shortLabel?: string;
  major: string;
  role?: string;
  company?: string;
  grade?: string;
  rate?: string;
  bookingUrl?: string;
  venmoUsername?: string;
  college: string;
  school?: string;
  imageSrc?: string;
  source: string;
  id: string;
  submittedAt?: string;
};

export default function AdminEditPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [allTutors, setAllTutors] = useState<Record<string, Record<string, Tutor[]>>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'pending' | 'database' | 'bookings' | 'verified-sessions' | 'payments'>('pending');
  const [payments, setPayments] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [editingTutor, setEditingTutor] = useState<Tutor | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<Tutor>>({});
  const [tutorSearchQuery, setTutorSearchQuery] = useState<string>('');

  const openTutorCalendar = async (booking: any) => {
    try {
      // Open Google Calendar as peerpointtutors@gmail.com
      // Tutors should share their calendars with peerpointtutors@gmail.com
      // This allows the admin to view and cancel events directly
      const calendarUrl = 'https://calendar.google.com/calendar/u/0/r';
      window.open(calendarUrl, '_blank', 'noopener,noreferrer');
      
      // Show instructions
      setTimeout(() => {
        alert(`Opened Google Calendar (peerpointtutors@gmail.com).\n\nTo find and cancel the booking:\n1. Make sure you're logged in as peerpointtutors@gmail.com\n2. Use the search box (top center)\n3. Search for: ${booking.bookingId}\n4. Or search for: ${booking.tutorName}\n5. Click on the event and delete it\n\nNote: The tutor must share their calendar with peerpointtutors@gmail.com for this to work.`);
      }, 500);
    } catch (error) {
      console.error('Error opening calendar:', error);
      // Fallback to basic Google Calendar
      window.open('https://calendar.google.com/calendar/u/0/r', '_blank', 'noopener,noreferrer');
      alert(`Opened Google Calendar.\n\nSearch for booking ID: ${booking.bookingId}\nOr search for tutor: ${booking.tutorName}\n\nMake sure you're logged in as peerpointtutors@gmail.com`);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      if (activeTab === 'pending') {
        fetchSubmissions();
      } else if (activeTab === 'database') {
        fetchAllTutors();
      } else if (activeTab === 'bookings' || activeTab === 'verified-sessions') {
        fetchBookings();
      } else if (activeTab === 'payments') {
        fetchPayments();
      }
    }
  }, [isAuthenticated, activeTab]);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setPasswordError('');
      setPasswordInput('');
    } else {
      setPasswordError('Incorrect password. Please try again.');
    }
  };

  const fetchSubmissions = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/tutor-submissions');
      if (response.ok) {
        const data = await response.json();
        // Filter out already processed submissions
        const pending = data.filter((sub: Submission) => !sub.processed);
        setSubmissions(pending);
      }
    } catch (error) {
      console.error('Error fetching submissions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccept = async (submission: Submission) => {
    try {
      const response = await fetch('/api/accept-tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submission),
      });

      if (response.ok) {
        // Remove from pending list
        setSubmissions((prev) =>
          prev.filter((s) => s.submittedAt !== submission.submittedAt)
        );
        // Refresh database if on that tab
        if (activeTab === 'database') {
          fetchAllTutors();
        }
        alert('Tutor accepted and added to website!');
      } else {
        alert('Error accepting tutor. Please try again.');
      }
    } catch (error) {
      console.error('Error accepting tutor:', error);
      alert('Error accepting tutor. Please try again.');
    }
  };

  const handleDeny = async (submission: Submission) => {
    if (!confirm('Are you sure you want to deny this application?')) {
      return;
    }

    try {
      const response = await fetch('/api/deny-tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ submittedAt: submission.submittedAt }),
      });

      if (response.ok) {
        // Remove from pending list
        setSubmissions((prev) =>
          prev.filter((s) => s.submittedAt !== submission.submittedAt)
        );
        alert('Application denied.');
      } else {
        alert('Error denying application. Please try again.');
      }
    } catch (error) {
      console.error('Error denying tutor:', error);
      alert('Error denying application. Please try again.');
    }
  };

  const fetchAllTutors = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/all-tutors');
      if (response.ok) {
        const data = await response.json();
        setAllTutors(data.tutors || {});
      }
    } catch (error) {
      console.error('Error fetching all tutors:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPayments = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/payments');
      if (response.ok) {
        const data = await response.json();
        setPayments(data.payments || []);
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBookings = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/bookings/list');
      if (response.ok) {
        const data = await response.json();
        setBookings(data.bookings || []);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyBooking = async (bookingId: string) => {
    if (!confirm('Verify payment and confirm this booking? The booking will be added to Verified Sessions.')) {
      return;
    }

    try {
      const response = await fetch('/api/bookings/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId,
          verifiedBy: 'admin',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Refresh bookings list
          fetchBookings();
          alert('Booking verified! The session has been added to Verified Sessions.');
        } else {
          alert(data.message || 'Failed to verify booking');
        }
      } else {
        alert('Error verifying booking. Please try again.');
      }
    } catch (error) {
      console.error('Error verifying booking:', error);
      alert('Error verifying booking. Please try again.');
    }
  };

  const handleRejectBooking = async (bookingId: string) => {
    const booking = bookings.find(b => b.bookingId === bookingId);
    const isVerified = booking?.status === 'verified';
    
    const confirmMessage = isVerified 
      ? 'Cancel this verified appointment? The booking will be rejected. Google Calendar will open - search for the booking ID to find and cancel the event.'
      : 'Reject this booking? The booking will be rejected. Google Calendar will open - search for the booking ID to find and cancel the event if it exists.';
    
    if (!confirm(confirmMessage)) {
      return;
    }

    try {
      const response = await fetch('/api/bookings/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId,
          rejectedBy: 'admin',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Refresh bookings list
          fetchBookings();
          
          // Open tutor's calendar
          if (booking) {
            await openTutorCalendar(booking);
          }
          
          // Don't show alert here since openTutorCalendar shows one
        } else {
          alert(data.message || 'Failed to reject booking');
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert(errorData.message || 'Error rejecting booking. Please try again.');
      }
    } catch (error) {
      console.error('Error rejecting booking:', error);
      alert('Error rejecting booking. Please try again.');
    }
  };

  const handleDeleteBooking = async (bookingId: string) => {
    if (!confirm('Are you sure you want to delete this booking? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/bookings/delete?bookingId=${encodeURIComponent(bookingId)}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          fetchBookings();
          alert('Booking deleted successfully');
        } else {
          alert(data.message || 'Failed to delete booking');
        }
      } else {
        alert('Error deleting booking. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting booking:', error);
      alert('Error deleting booking. Please try again.');
    }
  };

  const handleDeletePayment = async (paymentId: string) => {
    if (!confirm('Are you sure you want to delete this payment record? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/payments/delete?paymentId=${encodeURIComponent(paymentId)}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          fetchPayments();
          alert('Payment deleted successfully');
        } else {
          alert(data.message || 'Failed to delete payment');
        }
      } else {
        alert('Error deleting payment. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting payment:', error);
      alert('Error deleting payment. Please try again.');
    }
  };

  const handleDeleteTutor = async (tutor: Tutor) => {
    if (!confirm(`Are you sure you want to remove ${tutor.name} from the website?`)) {
      return;
    }

    try {
      let response;
      if (tutor.source === 'static') {
        // Remove static tutor
        response = await fetch('/api/remove-static-tutor', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: tutor.name }),
        });
      } else {
        // Remove dynamic tutor
        response = await fetch('/api/delete-tutor', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: tutor.id,
            submittedAt: tutor.submittedAt,
          }),
        });
      }

      if (response.ok) {
        // Refresh the list
        fetchAllTutors();
        alert(`${tutor.name} has been removed from the website.`);
      } else {
        alert('Error deleting tutor. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting tutor:', error);
      alert('Error deleting tutor. Please try again.');
    }
  };

  // Calculate total tutors count
  const getTotalTutors = () => {
    let total = 0;
    Object.values(allTutors).forEach((school) => {
      Object.values(school).forEach((college) => {
        total += college.length;
      });
    });
    return total;
  };

  // Filter tutors by first name using useMemo
  const filteredTutors = useMemo(() => {
    if (!tutorSearchQuery.trim()) {
      return allTutors;
    }

    const searchQuery = tutorSearchQuery.trim().toLowerCase();
    const filtered: Record<string, Record<string, Tutor[]>> = {};

    Object.entries(allTutors).forEach(([school, colleges]) => {
      const filteredColleges: Record<string, Tutor[]> = {};
      
      Object.entries(colleges).forEach(([college, tutorList]) => {
        const filteredTutorList = tutorList.filter((tutor) => {
          const firstName = tutor.name.split(' ')[0].toLowerCase();
          return firstName === searchQuery;
        });
        
        if (filteredTutorList.length > 0) {
          filteredColleges[college] = filteredTutorList;
        }
      });
      
      if (Object.keys(filteredColleges).length > 0) {
        filtered[school] = filteredColleges;
      }
    });

    return filtered;
  }, [allTutors, tutorSearchQuery]);

  const handleEditTutor = (tutor: Tutor) => {
    setEditingTutor(tutor);
    setEditFormData({
      name: tutor.name,
      major: tutor.major,
      role: tutor.role || '',
      company: tutor.company || '',
      grade: tutor.grade || '',
      rate: tutor.rate || '',
      bookingUrl: tutor.bookingUrl || '',
      venmoUsername: tutor.venmoUsername || '',
    });
  };

  const handleSaveEdit = async () => {
    if (!editingTutor) return;

    try {
      const response = await fetch('/api/update-tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...editingTutor,
          ...editFormData,
        }),
      });

      if (response.ok) {
        // Refresh the list
        fetchAllTutors();
        setEditingTutor(null);
        setEditFormData({});
        alert('Tutor information updated successfully!');
      } else {
        alert('Error updating tutor. Please try again.');
      }
    } catch (error) {
      console.error('Error updating tutor:', error);
      alert('Error updating tutor. Please try again.');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4 text-neutral-900">
        <div className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-900 text-[10px] font-semibold text-white">
                PPT
              </div>
              <span className="text-xs font-semibold uppercase tracking-[0.25em] text-neutral-500">
                Admin Edit Mode
              </span>
            </div>
          </div>
          <h1 className="mb-2 text-xl font-semibold text-neutral-900">
            Enter admin password
          </h1>
          <p className="mb-6 text-sm text-neutral-600">
            This is the owner-only edit mode. Enter the admin password to access
            pending tutor applications and edit the website.
          </p>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-medium uppercase tracking-[0.18em] text-neutral-500">
                Admin Password
              </label>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => {
                  setPasswordInput(e.target.value);
                  if (passwordError) setPasswordError('');
                }}
                className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-800 focus:ring-1 focus:ring-neutral-800"
                placeholder="Enter admin password"
              />
              {passwordError && (
                <p className="mt-2 text-xs text-red-500">{passwordError}</p>
              )}
            </div>
            <button
              type="submit"
              className="flex w-full items-center justify-center rounded-full bg-neutral-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-black"
            >
              Access Edit Mode
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-neutral-200 bg-white px-8 py-5 md:px-16">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-900 text-[10px] font-semibold text-white">
                PPT
              </div>
              <span className="text-sm font-semibold uppercase tracking-[0.25em] text-neutral-600">
                PeerPointTutors
              </span>
            </Link>
            <span className="text-xs font-medium text-neutral-500">
              • Edit Mode
            </span>
          </div>
          <button
            onClick={() => setIsAuthenticated(false)}
            className="text-xs font-medium text-neutral-600 hover:text-neutral-900"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-6xl px-6 py-12 md:px-16">
        {/* Tabs */}
        <div className="mb-8 border-b border-neutral-200">
          <div className="flex gap-6">
            <button
              onClick={() => setActiveTab('pending')}
              className={`pb-4 text-sm font-medium transition ${
                activeTab === 'pending'
                  ? 'border-b-2 border-neutral-900 text-neutral-900'
                  : 'text-neutral-500 hover:text-neutral-700'
              }`}
            >
              Pending Tutors
            </button>
            <button
              onClick={() => setActiveTab('database')}
              className={`pb-4 text-sm font-medium transition ${
                activeTab === 'database'
                  ? 'border-b-2 border-neutral-900 text-neutral-900'
                  : 'text-neutral-500 hover:text-neutral-700'
              }`}
            >
              Tutor Database
            </button>
            <button
              onClick={() => setActiveTab('bookings')}
              className={`pb-4 text-sm font-medium transition ${
                activeTab === 'bookings'
                  ? 'border-b-2 border-neutral-900 text-neutral-900'
                  : 'text-neutral-500 hover:text-neutral-700'
              }`}
            >
              Bookings
            </button>
            <button
              onClick={() => setActiveTab('verified-sessions')}
              className={`pb-4 text-sm font-medium transition ${
                activeTab === 'verified-sessions'
                  ? 'border-b-2 border-neutral-900 text-neutral-900'
                  : 'text-neutral-500 hover:text-neutral-700'
              }`}
            >
              Verified Sessions
            </button>
            <button
              onClick={() => setActiveTab('payments')}
              className={`pb-4 text-sm font-medium transition ${
                activeTab === 'payments'
                  ? 'border-b-2 border-neutral-900 text-neutral-900'
                  : 'text-neutral-500 hover:text-neutral-700'
              }`}
            >
              Payments
            </button>
          </div>
        </div>

        {activeTab === 'pending' ? (
          <>
            <div className="mb-8">
              <h1 className="mb-3 text-3xl font-semibold text-neutral-900">
                Pending Tutors
              </h1>
              <p className="text-sm text-neutral-600">
                Review and accept or deny tutor applications. Accepted tutors will
                be automatically added to the website.
              </p>
            </div>

            {isLoading ? (
              <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-8 text-center">
                <p className="text-sm text-neutral-600">Loading submissions...</p>
              </div>
            ) : submissions.length === 0 ? (
              <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-8 text-center">
                <p className="text-sm text-neutral-600">
                  No pending tutor applications.
                </p>
              </div>
            ) : (
          <div className="space-y-6">
            {submissions.map((submission, index) => (
              <div
                key={index}
                className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm"
              >
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
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

                  {/* Middle Columns - Details */}
                  <div className="lg:col-span-2 space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="font-medium text-neutral-700">Major(s):</p>
                        <p className="text-neutral-600">{submission.majors}</p>
                      </div>
                      <div>
                        <p className="font-medium text-neutral-700">Position:</p>
                        <p className="text-neutral-600">
                          {submission.internshipOrJob}
                        </p>
                      </div>
                      <div>
                        <p className="font-medium text-neutral-700">Company:</p>
                        <p className="text-neutral-600">{submission.company}</p>
                      </div>
                      <div>
                        <p className="font-medium text-neutral-700">Email:</p>
                        <p className="text-neutral-600">{submission.contactInformation || 'Not provided'}</p>
                      </div>
                      <div>
                        <p className="font-medium text-neutral-700">Meeting Preference:</p>
                        <p className="text-neutral-600">{submission.meetingPreference || 'Not specified'}</p>
                      </div>
                      <div>
                        <p className="font-medium text-neutral-700">Hourly Rate:</p>
                        <p className="text-neutral-600">
                          {submission.rate ? `$${submission.rate}/hour` : 'Not specified'}
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

                    <div>
                      <p className="mb-1 font-medium text-neutral-700 text-sm">
                        Classes to Tutor:
                      </p>
                      <p className="text-sm text-neutral-600 whitespace-pre-line">
                        {submission.classes}
                      </p>
                    </div>

                    <div>
                      <p className="mb-1 font-medium text-neutral-700 text-sm">
                        Extracurriculars:
                      </p>
                      <p className="text-sm text-neutral-600 whitespace-pre-line">
                        {submission.extracurriculars}
                      </p>
                    </div>
                  </div>

                  {/* Right Column - Actions */}
                  <div className="flex flex-col gap-3">
                    <button
                      onClick={() => handleAccept(submission)}
                      className="rounded-full bg-neutral-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-black"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleDeny(submission)}
                      className="rounded-full border border-neutral-300 bg-white px-4 py-2.5 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-50"
                    >
                      Deny
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
            )}
          </>
        ) : activeTab === 'database' ? (
          <>
            <div className="mb-8">
              <h1 className="mb-3 text-3xl font-semibold text-neutral-900">
                Tutor Database
              </h1>
              <p className="text-sm text-neutral-600">
                View and manage all tutors on the website. You can remove any tutor from the platform.
              </p>
            </div>

            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative">
                <input
                  type="text"
                  value={tutorSearchQuery}
                  onChange={(e) => setTutorSearchQuery(e.target.value)}
                  placeholder="Search by first name..."
                  className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-2.5 pl-10 text-sm text-neutral-900 placeholder:text-neutral-400 outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
                />
                <svg
                  className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                {tutorSearchQuery && (
                  <button
                    onClick={() => setTutorSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {isLoading ? (
              <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-8 text-center">
                <p className="text-sm text-neutral-600">Loading tutors...</p>
              </div>
            ) : Object.keys(allTutors).length === 0 ? (
              <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-8 text-center">
                <p className="text-sm text-neutral-600">
                  No tutors in the database yet.
                </p>
              </div>
            ) : Object.keys(filteredTutors).length === 0 ? (
              <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-8 text-center">
                <p className="text-sm text-neutral-600">
                  No tutors found matching "{tutorSearchQuery}".
                </p>
                <button
                  onClick={() => setTutorSearchQuery('')}
                  className="mt-2 text-sm text-blue-600 hover:text-blue-800 underline"
                >
                  Clear search
                </button>
              </div>
            ) : (
              <div className="space-y-8">
                {Object.entries(filteredTutors).map(([school, colleges]) => (
                  <div key={school} className="space-y-6">
                    <div className="border-b border-neutral-300 pb-2">
                      <h2 className="text-2xl font-semibold text-neutral-900">{school}</h2>
                    </div>
                    {Object.entries(colleges).map(([college, tutors]) => (
                      <div key={college} className="space-y-3">
                        <h3 className="text-lg font-medium text-neutral-700">{college}</h3>
                        <div className="rounded-lg border border-neutral-200 bg-white overflow-hidden">
                          <table className="w-full">
                            <thead className="bg-neutral-50">
                              <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-700">
                                  Photo
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-700">
                                  Name
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-700">
                                  Major
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-700">
                                  Grade
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-700">
                                  Rate
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-700">
                                  Actions
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-200">
                              {tutors.map((tutor) => (
                                <tr key={tutor.id} className="hover:bg-neutral-50">
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    {tutor.imageSrc ? (
                                      <div className="relative h-12 w-12 overflow-hidden rounded-full border-2 border-neutral-200">
                                        <img
                                          src={tutor.imageSrc}
                                          alt={tutor.name}
                                          className="h-full w-full object-cover"
                                        />
                                      </div>
                                    ) : (
                                      <div className="h-12 w-12 rounded-full bg-neutral-200 flex items-center justify-center">
                                        <span className="text-xs text-neutral-500">No photo</span>
                                      </div>
                                    )}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-neutral-900">
                                      {tutor.name}
                                    </div>
                                    {tutor.role && (
                                      <div className="text-xs text-neutral-500">
                                        {tutor.role}
                                        {tutor.company && ` at ${tutor.company}`}
                                      </div>
                                    )}
                                  </td>
                                  <td className="px-6 py-4 text-sm text-neutral-600">
                                    {tutor.major}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600">
                                    {tutor.grade || '-'}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600">
                                    {tutor.rate ? `$${calculateDisplayRate(tutor.rate)}/hr` : '-'}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <div className="flex gap-2">
                                      <button
                                        onClick={() => handleEditTutor(tutor)}
                                        className="text-blue-600 hover:text-blue-800 font-medium"
                                      >
                                        Edit
                                      </button>
                                      <button
                                        onClick={() => handleDeleteTutor(tutor)}
                                        className="text-red-600 hover:text-red-800 font-medium"
                                      >
                                        Remove
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
                <div className="pt-4 border-t border-neutral-200">
                  <p className="text-sm text-neutral-600">
                    {tutorSearchQuery ? (
                      <>
                        Showing <span className="font-semibold">{Object.values(filteredTutors).reduce((acc, colleges) => acc + Object.values(colleges).reduce((sum, tutors) => sum + tutors.length, 0), 0)}</span> tutor(s) matching "{tutorSearchQuery}"
                        {' • '}
                        <button
                          onClick={() => setTutorSearchQuery('')}
                          className="text-blue-600 hover:text-blue-800 underline"
                        >
                          Clear search
                        </button>
                      </>
                    ) : (
                      <>
                        Total tutors: <span className="font-semibold">{getTotalTutors()}</span>
                      </>
                    )}
                  </p>
                </div>
              </div>
            )}
          </>
        ) : activeTab === 'bookings' ? (
          <>
            <div className="mb-8">
              <h1 className="mb-3 text-3xl font-semibold text-neutral-900">
                Booking Payment Verification
              </h1>
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 mb-4">
                <p className="text-sm font-semibold text-blue-900 mb-1">
                  Payment Verification
                </p>
                <p className="text-xs text-blue-800">
                  Students can proceed to booking immediately after submitting payment details. 
                  You should verify their payments by checking each booking&apos;s payment details against your Venmo account. 
                  If payment was received and matches, click &quot;Verify Payment&quot; to confirm. 
                  If payment was not received or doesn&apos;t match, click &quot;Reject Booking&quot; to cancel the appointment and release the time slot.
                </p>
              </div>
            </div>

            {isLoading ? (
              <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-8 text-center">
                <p className="text-sm text-neutral-600">Loading bookings...</p>
              </div>
            ) : bookings.length === 0 ? (
              <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-8 text-center">
                <p className="text-sm text-neutral-600">
                  No bookings found.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Pending Bookings */}
                {bookings.filter((b) => b.status === 'pending').length > 0 && (
                  <div>
                    <h2 className="mb-4 text-xl font-semibold text-neutral-900">
                      Pending Verification ({bookings.filter((b) => b.status === 'pending').length})
                    </h2>
                    <div className="space-y-3">
                      {bookings
                        .filter((b) => b.status === 'pending')
                        .map((booking) => (
                          <div
                            key={booking.bookingId}
                            className="rounded-lg border border-yellow-200 bg-yellow-50 p-6 relative"
                          >
                            <button
                              onClick={() => handleDeleteBooking(booking.bookingId)}
                              className="absolute top-4 right-4 text-neutral-400 hover:text-red-600 transition-colors"
                              title="Delete booking"
                            >
                              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="mb-2 flex items-center gap-2">
                                  <span className="rounded-full bg-yellow-200 px-2 py-1 text-xs font-semibold text-yellow-800">
                                    PENDING
                                  </span>
                                  <span className="text-sm text-neutral-600">
                                    Created: {new Date(booking.createdAt).toLocaleString()}
                                  </span>
                                </div>
                                <h3 className="mb-2 text-lg font-semibold text-neutral-900">
                                  {booking.tutorName}
                                </h3>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <span className="font-medium text-neutral-700">Amount:</span>
                                    <span className="ml-2 text-neutral-900">${booking.amount}</span>
                                  </div>
                                  <div>
                                    <span className="font-medium text-neutral-700">Payment Reference (Tutor Name):</span>
                                    <span className="ml-2 text-neutral-900">{booking.paymentReference}</span>
                                  </div>
                                  <div>
                                    <span className="font-medium text-neutral-700">Expires:</span>
                                    <span className={`ml-2 ${
                                      new Date(booking.expiresAt) < new Date() 
                                        ? 'text-red-600 font-semibold' 
                                        : 'text-neutral-600'
                                    }`}>
                                      {new Date(booking.expiresAt).toLocaleString()}
                                    </span>
                                  </div>
                                  {booking.tutorVenmo && (
                                    <div>
                                      <span className="font-medium text-neutral-700">Tutor Venmo:</span>
                                      <span className="ml-2 text-neutral-900">@{booking.tutorVenmo}</span>
                                    </div>
                                  )}
                                </div>
                                {booking.paymentAmount && booking.venmoAddress && (
                                  <div className="mt-3 rounded bg-blue-50 border border-blue-200 p-3">
                                    <p className="text-xs font-semibold text-blue-700 mb-2">
                                      Payment Details Submitted:
                                    </p>
                                    <div className="space-y-1 text-xs text-blue-900">
                                      <div>
                                        <span className="font-medium">Amount Paid:</span> ${booking.paymentAmount}
                                        {booking.paymentAmount !== booking.amount && (
                                          <span className="text-red-600 ml-1">
                                            (Expected: ${booking.amount})
                                          </span>
                                        )}
                                      </div>
                                      <div>
                                        <span className="font-medium">Venmo Address:</span> {booking.venmoAddress}
                                      </div>
                                      <div className="text-blue-700 mt-2">
                                        Submitted: {booking.paymentDetailsSubmittedAt ? new Date(booking.paymentDetailsSubmittedAt).toLocaleString() : 'N/A'}
                                      </div>
                                    </div>
                                  </div>
                                )}
                                <div className="mt-3 rounded bg-white p-3">
                                  <p className="text-xs font-semibold text-neutral-700 mb-1">
                                    Verification Instructions:
                                  </p>
                                  <ol className="text-xs text-neutral-600 space-y-1 list-decimal list-inside">
                                    <li>Check Venmo for payment with tutor name in note: <span className="font-semibold">{booking.paymentReference}</span></li>
                                    {booking.paymentAmount && (
                                      <>
                                        <li>Verify amount matches: <span className="font-semibold">${booking.paymentAmount}</span></li>
                                        <li>Verify Venmo address matches: <span className="font-semibold">{booking.venmoAddress}</span></li>
                                      </>
                                    )}
                                    <li>Click "Verify Payment" below to confirm the booking</li>
                                  </ol>
                                </div>
                              </div>
                              <div className="ml-4 flex flex-col gap-2">
                                <button
                                  onClick={() => handleVerifyBooking(booking.bookingId)}
                                  className="rounded-full bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-700 whitespace-nowrap"
                                >
                                  Verify Payment
                                </button>
                                <button
                                  onClick={() => handleRejectBooking(booking.bookingId)}
                                  className="rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 whitespace-nowrap"
                                >
                                  Reject Booking
                                </button>
                                {booking.bookingUrl && (
                                  <button
                                    onClick={() => openTutorCalendar(booking)}
                                    className="rounded-full border border-neutral-300 bg-white px-4 py-2 text-xs font-semibold text-neutral-700 transition hover:bg-neutral-50 whitespace-nowrap text-center"
                                    title="Open tutor's Google Calendar to view and cancel appointments"
                                  >
                                    Open Calendar
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* Verified Bookings */}
                {bookings.filter((b) => b.status === 'verified').length > 0 && (
                  <div className="mt-8">
                    <h2 className="mb-4 text-xl font-semibold text-neutral-900">
                      Verified ({bookings.filter((b) => b.status === 'verified').length})
                    </h2>
                    <div className="space-y-3">
                      {bookings
                        .filter((b) => b.status === 'verified')
                        .map((booking) => (
                          <div
                            key={booking.bookingId}
                            className="rounded-lg border border-green-200 bg-green-50 p-6 relative"
                          >
                            <button
                              onClick={() => handleDeleteBooking(booking.bookingId)}
                              className="absolute top-4 right-4 text-neutral-400 hover:text-red-600 transition-colors"
                              title="Delete verified session"
                            >
                              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="mb-2 flex items-center gap-2">
                                  <span className="rounded-full bg-green-200 px-2 py-1 text-xs font-semibold text-green-800">
                                    VERIFIED
                                  </span>
                                  <span className="text-sm text-neutral-600">
                                    Verified: {booking.verifiedAt ? new Date(booking.verifiedAt).toLocaleString() : 'N/A'}
                                  </span>
                                </div>
                                <h3 className="mb-2 text-lg font-semibold text-neutral-900">
                                  {booking.tutorName}
                                </h3>
                                <div className="text-sm text-neutral-600">
                                  <span className="font-medium">Amount:</span> ${booking.amount} • 
                                  <span className="font-medium ml-2">Tutor:</span> <span>{booking.paymentReference}</span>
                                </div>
                                {booking.bookingId && (
                                  <div className="mt-2 text-xs text-neutral-500">
                                    Booking ID: {booking.bookingId}
                                  </div>
                                )}
                              </div>
                              <div className="ml-4 flex flex-col gap-2">
                                {booking.bookingUrl && (
                                  <button
                                    onClick={() => openTutorCalendar(booking)}
                                    className="rounded-full border border-neutral-300 bg-white px-4 py-2 text-xs font-semibold text-neutral-700 transition hover:bg-neutral-50 whitespace-nowrap"
                                    title="Open tutor's Google Calendar to view and cancel appointments"
                                  >
                                    Cancel Appointment
                                  </button>
                                )}
                                <button
                                  onClick={() => handleRejectBooking(booking.bookingId)}
                                  className="rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 whitespace-nowrap"
                                >
                                  Reject Booking
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* Rejected Bookings */}
                {bookings.filter((b) => b.status === 'rejected').length > 0 && (
                  <div className="mt-8">
                    <h2 className="mb-4 text-xl font-semibold text-neutral-900">
                      Rejected ({bookings.filter((b) => b.status === 'rejected').length})
                    </h2>
                    <div className="space-y-3">
                      {bookings
                        .filter((b) => b.status === 'rejected')
                        .map((booking) => (
                          <div
                            key={booking.bookingId}
                            className="rounded-lg border border-red-200 bg-red-50 p-6"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="mb-2 flex items-center gap-2">
                                  <span className="rounded-full bg-red-200 px-2 py-1 text-xs font-semibold text-red-800">
                                    REJECTED
                                  </span>
                                  <span className="text-sm text-neutral-600">
                                    Created: {new Date(booking.createdAt).toLocaleString()}
                                    {booking.rejectedAt && (
                                      <> • Rejected: {new Date(booking.rejectedAt).toLocaleString()}</>
                                    )}
                                  </span>
                                </div>
                                <h3 className="mb-2 text-lg font-semibold text-neutral-900">
                                  {booking.tutorName}
                                </h3>
                                <div className="text-sm text-neutral-600">
                                  <span className="font-medium">Amount:</span> ${booking.amount} • 
                                  <span className="font-medium ml-2">Tutor:</span> <span>{booking.paymentReference}</span>
                                </div>
                                {booking.rejectedBy && (
                                  <div className="text-xs text-red-700 mt-1">
                                    Rejected by: {booking.rejectedBy}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* Expired Bookings */}
                {bookings.filter((b) => b.status === 'expired').length > 0 && (
                  <div className="mt-8">
                    <h2 className="mb-4 text-xl font-semibold text-neutral-900">
                      Expired ({bookings.filter((b) => b.status === 'expired').length})
                    </h2>
                    <div className="space-y-3">
                      {bookings
                        .filter((b) => b.status === 'expired')
                        .map((booking) => (
                          <div
                            key={booking.bookingId}
                            className="rounded-lg border border-red-200 bg-red-50 p-6"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="mb-2 flex items-center gap-2">
                                  <span className="rounded-full bg-red-200 px-2 py-1 text-xs font-semibold text-red-800">
                                    EXPIRED
                                  </span>
                                  <span className="text-sm text-neutral-600">
                                    Created: {new Date(booking.createdAt).toLocaleString()}
                                  </span>
                                </div>
                                <h3 className="mb-2 text-lg font-semibold text-neutral-900">
                                  {booking.tutorName}
                                </h3>
                                <div className="text-sm text-neutral-600">
                                  <span className="font-medium">Amount:</span> ${booking.amount} • 
                                  <span className="font-medium ml-2">Tutor:</span> <span>{booking.paymentReference}</span>
                                </div>
                                <p className="text-xs text-red-700 mt-2">
                                  This booking expired after 2 hours without payment verification. Time slot has been released.
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        ) : activeTab === 'verified-sessions' ? (
          <>
            <div className="mb-8">
              <h1 className="mb-3 text-3xl font-semibold text-neutral-900">
                Verified Sessions
              </h1>
              <p className="text-sm text-neutral-600">
                View all verified booking sessions with detailed information.
              </p>
            </div>

            {isLoading ? (
              <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-8 text-center">
                <p className="text-sm text-neutral-600">Loading verified sessions...</p>
              </div>
            ) : bookings.filter((b) => b.status === 'verified').length === 0 ? (
              <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-8 text-center">
                <p className="text-sm text-neutral-600">
                  No verified sessions yet.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {bookings
                  .filter((b) => b.status === 'verified')
                  .map((booking) => (
                    <div
                      key={booking.bookingId}
                      className="rounded-lg border border-green-200 bg-green-50 p-6 relative"
                    >
                      <button
                        onClick={() => handleDeleteBooking(booking.bookingId)}
                        className="absolute top-4 right-4 text-neutral-400 hover:text-red-600 transition-colors"
                        title="Delete verified session"
                      >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="mb-3 flex items-center gap-2">
                            <span className="rounded-full bg-green-200 px-2 py-1 text-xs font-semibold text-green-800">
                              VERIFIED
                            </span>
                            <span className="text-sm text-neutral-600">
                              Verified: {booking.verifiedAt ? new Date(booking.verifiedAt).toLocaleString() : 'N/A'}
                            </span>
                            {booking.verifiedBy && (
                              <span className="text-xs text-neutral-500">
                                by {booking.verifiedBy}
                              </span>
                            )}
                          </div>
                          <h3 className="mb-4 text-xl font-semibold text-neutral-900">
                            {booking.tutorName}
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div className="space-y-2">
                              <div>
                                <span className="font-medium text-neutral-700">Session Amount:</span>
                                <span className="ml-2 text-neutral-900">${booking.amount}</span>
                              </div>
                              {booking.rate && (
                                <div>
                                  <span className="font-medium text-neutral-700">Rate:</span>
                                  <span className="ml-2 text-neutral-900">${booking.rate}/hour</span>
                                </div>
                              )}
                              {booking.paymentAmount && (
                                <div>
                                  <span className="font-medium text-neutral-700">Amount Paid:</span>
                                  <span className="ml-2 text-neutral-900">${booking.paymentAmount}</span>
                                </div>
                              )}
                            </div>
                            <div className="space-y-2">
                              <div>
                                <span className="font-medium text-neutral-700">Payment Reference:</span>
                                <span className="ml-2 text-neutral-900">{booking.paymentReference}</span>
                              </div>
                              {booking.venmoAddress && (
                                <div>
                                  <span className="font-medium text-neutral-700">Student Venmo:</span>
                                  <span className="ml-2 text-neutral-900">{booking.venmoAddress}</span>
                                </div>
                              )}
                              {booking.tutorVenmo && (
                                <div>
                                  <span className="font-medium text-neutral-700">Tutor Venmo:</span>
                                  <span className="ml-2 text-neutral-900">@{booking.tutorVenmo}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          {booking.bookingUrl && (
                            <div className="mt-4 pt-4 border-t border-green-200">
                              <a
                                href={booking.bookingUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 text-sm font-medium text-green-700 hover:text-green-800"
                              >
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                                View Booking Calendar
                              </a>
                            </div>
                          )}
                          <div className="mt-3 text-xs text-neutral-500">
                            Booking ID: <span className="font-mono">{booking.bookingId}</span> • 
                            Created: {new Date(booking.createdAt).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </>
        ) : activeTab === 'payments' ? (
          <>
            <div className="mb-8">
              <h1 className="mb-3 text-3xl font-semibold text-neutral-900">
                Payments
              </h1>
              <p className="text-sm text-neutral-600">
                View all payment transactions from tutoring sessions. Click "Pay Tutor" to send the tutor their portion via Venmo.
              </p>
            </div>

            {/* Payment Breakdown by Rate Table */}
            <div className="mb-8 rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
              <h2 className="mb-3 text-base font-semibold text-neutral-900">
                Payment Breakdown by Rate
              </h2>
              <div className="overflow-x-auto">
                <table className="min-w-full text-xs">
                  <thead>
                    <tr className="border-b border-neutral-200">
                      <th className="px-3 py-2 text-left font-medium text-neutral-700">Tutor Rate</th>
                      <th className="px-3 py-2 text-left font-medium text-neutral-700">Student Pays</th>
                      <th className="px-3 py-2 text-left font-medium text-neutral-700">Tutor Gets</th>
                      <th className="px-3 py-2 text-left font-medium text-neutral-700">PeerPoint Keeps</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200">
                    {[
                      { tutorRate: 15, studentPays: 17 },
                      { tutorRate: 20, studentPays: 22 },
                      { tutorRate: 25, studentPays: 27 },
                      { tutorRate: 30, studentPays: 33 },
                      { tutorRate: 35, studentPays: 38 },
                      { tutorRate: 40, studentPays: 44 },
                      { tutorRate: 45, studentPays: 49 },
                      { tutorRate: 50, studentPays: 55 },
                    ].map(({ tutorRate, studentPays }) => {
                      const platformFee = studentPays - tutorRate;
                      const tutorAmount = tutorRate;

                      return (
                        <tr key={tutorRate} className="hover:bg-neutral-50">
                          <td className="px-3 py-2 text-neutral-900">${tutorRate}/hr</td>
                          <td className="px-3 py-2 text-neutral-900 font-medium">${studentPays}</td>
                          <td className="px-3 py-2 text-neutral-700">${tutorAmount}</td>
                          <td className="px-3 py-2 text-neutral-700">${platformFee}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Price Breakdown Chart */}
            {payments.length > 0 && (
              <div className="mb-8 rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-lg font-semibold text-neutral-900">
                  Payment Breakdown Summary
                </h2>
                {(() => {
                  // Calculate totals from all payments
                  const totalRevenue = payments.reduce((sum, p) => sum + (p.totalAmount || p.amount || 0), 0);
                  const totalProfit = payments.reduce((sum, p) => sum + (p.platformFee || 2), 0);
                  const totalTutorPayout = payments.reduce((sum, p) => sum + (p.tutorAmount || Math.max(0, (p.totalAmount || p.amount || 0) - 2)), 0);
                  const profitPercentage = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;
                  const tutorPercentage = totalRevenue > 0 ? (totalTutorPayout / totalRevenue) * 100 : 0;

                  return (
                    <div className="space-y-4">
                      {/* Total Revenue Bar */}
                      <div>
                        <div className="mb-2 flex items-center justify-between text-sm">
                          <span className="font-medium text-neutral-700">Total Revenue</span>
                          <span className="font-semibold text-neutral-900">${totalRevenue.toFixed(2)}</span>
                        </div>
                        <div className="h-8 w-full rounded-lg bg-neutral-200 overflow-hidden">
                          <div className="h-full flex">
                            {/* Tutor Portion */}
                            {tutorPercentage > 0 && (
                              <div 
                                className="bg-teal-500 flex items-center justify-end pr-2"
                                style={{ width: `${tutorPercentage}%` }}
                              >
                                {tutorPercentage > 10 && (
                                  <span className="text-xs font-semibold text-white">${totalTutorPayout.toFixed(2)}</span>
                                )}
                              </div>
                            )}
                            {/* Platform Fee */}
                            {profitPercentage > 0 && (
                              <div 
                                className="bg-neutral-900 flex items-center justify-end pr-2"
                                style={{ width: `${profitPercentage}%` }}
                              >
                                {profitPercentage > 10 && (
                                  <span className="text-xs font-semibold text-white">${totalProfit.toFixed(2)}</span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Breakdown Details */}
                      <div className="grid grid-cols-3 gap-4 pt-2">
                        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                            <span className="text-xs font-medium uppercase tracking-wider text-blue-700">
                              Total Revenue
                            </span>
                          </div>
                          <p className="text-2xl font-bold text-blue-900">${totalRevenue.toFixed(2)}</p>
                          <p className="text-xs text-blue-600 mt-1">{payments.length} payment{payments.length !== 1 ? 's' : ''}</p>
                        </div>
                        <div className="rounded-lg border border-teal-200 bg-teal-50 p-4">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="h-3 w-3 rounded-full bg-teal-500"></div>
                            <span className="text-xs font-medium uppercase tracking-wider text-teal-700">
                              Paid to Tutors
                            </span>
                          </div>
                          <p className="text-2xl font-bold text-teal-900">${totalTutorPayout.toFixed(2)}</p>
                          <p className="text-xs text-teal-600 mt-1">{tutorPercentage.toFixed(1)}% of revenue</p>
                        </div>
                        <div className="rounded-lg border border-neutral-300 bg-neutral-50 p-4">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="h-3 w-3 rounded-full bg-neutral-900"></div>
                            <span className="text-xs font-medium uppercase tracking-wider text-neutral-700">
                              Total Profit
                            </span>
                          </div>
                          <p className="text-2xl font-bold text-neutral-900">${totalProfit.toFixed(2)}</p>
                          <p className="text-xs text-neutral-600 mt-1">{profitPercentage.toFixed(1)}% of revenue</p>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {isLoading ? (
              <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-8 text-center">
                <p className="text-sm text-neutral-600">Loading payments...</p>
              </div>
            ) : payments.length === 0 ? (
              <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-8 text-center">
                <p className="text-sm text-neutral-600">
                  No payments recorded yet.
                </p>
              </div>
            ) : (
              <div className="rounded-lg border border-neutral-200 bg-white overflow-hidden">
                <table className="min-w-full divide-y divide-neutral-200">
                  <thead className="bg-neutral-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-700">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-700">
                        Tutor
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-700">
                        Venmo Username
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-700">
                        Total Received
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-700">
                        Tutor Payout
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-700">
                        Platform Fee
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-700">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200">
                    {payments.map((payment) => {
                      const totalAmount = payment.totalAmount || payment.amount || 0;
                      const tutorAmount = payment.tutorAmount || Math.max(0, totalAmount - 2);
                      const platformFee = payment.platformFee || 2;
                      const tutorVenmo = payment.tutorVenmo || '';
                      // Clean Venmo username: remove @ symbol and any whitespace
                      const cleanVenmo = tutorVenmo.replace(/@/g, '').trim();
                      const cleanAdminVenmo = ADMIN_VENMO_USERNAME.replace(/@/g, '').trim();
                      // Use recipients parameter to pre-fill the "To" field
                      // Note: Venmo uses the logged-in user as sender, but we include admin username in note for reference
                      const venmoUrl = cleanVenmo
                        ? `https://venmo.com/?txn=pay&recipients=${encodeURIComponent(cleanVenmo)}&amount=${tutorAmount}&note=${encodeURIComponent(`${payment.tutorName} Tutor Payment - From ${cleanAdminVenmo}`)}`
                        : null;
                      
                      return (
                        <tr key={payment.id} className="hover:bg-neutral-50 relative">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                            {new Date(payment.date).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900">
                            {payment.tutorName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600">
                            {tutorVenmo ? `@${tutorVenmo.replace('@', '')}` : <span className="text-neutral-400">Not set</span>}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                            ${totalAmount.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                            ${tutorAmount.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                            ${platformFee.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <div className="flex items-center gap-2">
                              {venmoUrl ? (
                                <a
                                  href={venmoUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 rounded-full bg-teal-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-teal-700"
                                >
                                  <svg
                                    className="h-3 w-3"
                                    viewBox="0 0 24 24"
                                    fill="currentColor"
                                  >
                                    <path d="M19.5 3.5L18 2l-1.5 1.5L15 2l-1.5 1.5L12 2l-1.5 1.5L9 2 7.5 3.5 6 2v14H3v3c0 1.66 1.34 3 3 3h12c1.66 0 3-1.34 3-3V2l-1.5 1.5zM19 19c0 .55-.45 1-1 1s-1-.45-1-1v-3H8V5h11v14z" />
                                  </svg>
                                  Pay Tutor
                                </a>
                              ) : (
                                <span className="text-xs text-neutral-400">
                                  No Venmo set
                                </span>
                              )}
                              <button
                                onClick={() => handleDeletePayment(payment.id)}
                                className="text-neutral-400 hover:text-red-600 transition-colors"
                                title="Delete payment"
                              >
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </>
        ) : null}

        {/* Edit Modal */}
        {editingTutor && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="w-full max-w-2xl rounded-xl border border-neutral-200 bg-white p-6 shadow-lg">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-neutral-900">
                  Edit Tutor: {editingTutor.name}
                </h2>
                <button
                  onClick={() => {
                    setEditingTutor(null);
                    setEditFormData({});
                  }}
                  className="text-neutral-400 hover:text-neutral-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-xs font-medium uppercase tracking-[0.18em] text-neutral-700">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={editFormData.name || ''}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, name: e.target.value })
                    }
                    className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium uppercase tracking-[0.18em] text-neutral-700">
                    Major *
                  </label>
                  <input
                    type="text"
                    value={editFormData.major || ''}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, major: e.target.value })
                    }
                    className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium uppercase tracking-[0.18em] text-neutral-700">
                    Role
                  </label>
                  <input
                    type="text"
                    value={editFormData.role || ''}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, role: e.target.value })
                    }
                    className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium uppercase tracking-[0.18em] text-neutral-700">
                    Company
                  </label>
                  <input
                    type="text"
                    value={editFormData.company || ''}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, company: e.target.value })
                    }
                    className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium uppercase tracking-[0.18em] text-neutral-700">
                    Grade
                  </label>
                  <select
                    value={editFormData.grade || ''}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, grade: e.target.value })
                    }
                    className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
                  >
                    <option value="">Select grade</option>
                    <option value="Freshman">Freshman</option>
                    <option value="Sophomore">Sophomore</option>
                    <option value="Junior">Junior</option>
                    <option value="Senior">Senior</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium uppercase tracking-[0.18em] text-neutral-700">
                    Base Rate ($)
                  </label>
                  <select
                    value={editFormData.rate || ''}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, rate: e.target.value })
                    }
                    className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
                  >
                    <option value="">Select rate</option>
                    <option value="15">$15/hour (displays as $17)</option>
                    <option value="20">$20/hour (displays as $22)</option>
                    <option value="25">$25/hour (displays as $27)</option>
                    <option value="30">$30/hour (displays as $33)</option>
                    <option value="35">$35/hour (displays as $38)</option>
                    <option value="40">$40/hour (displays as $44)</option>
                    <option value="45">$45/hour (displays as $49)</option>
                    <option value="50">$50/hour (displays as $55)</option>
                  </select>
                  {editFormData.rate && (
                    <p className="mt-1 text-xs text-neutral-500">
                      Students will see: ${calculateDisplayRate(editFormData.rate)}/hour
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium uppercase tracking-[0.18em] text-neutral-700">
                    Google Calendar Booking Link
                  </label>
                  <input
                    type="url"
                    value={(editFormData.bookingUrl as string) || ''}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, bookingUrl: e.target.value })
                    }
                    className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
                    placeholder="Paste the tutor's Google Calendar appointment schedule link"
                  />
                  <p className="mt-1 text-xs text-neutral-500">
                    This is the link students will open when they click "Open Google Calendar booking".
                  </p>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium uppercase tracking-[0.18em] text-neutral-700">
                    Venmo Username
                  </label>
                  <input
                    type="text"
                    value={(editFormData.venmoUsername as string) || ''}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, venmoUsername: e.target.value })
                    }
                    className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
                    placeholder="e.g., @yourusername"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => {
                    setEditingTutor(null);
                    setEditFormData({});
                  }}
                  className="rounded-full border border-neutral-300 bg-white px-4 py-2 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="rounded-full bg-neutral-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-black"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

