'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { calculateDisplayRate } from '../utils/rateCalculator';

const PEERPOINT_VENMO = 'peerpointtutors';

function PaymentPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [session, setSession] = useState<{
    tutorName: string;
    tutorVenmo?: string;
    rate?: string;
  } | null>(null);
  const [bookingStatus, setBookingStatus] = useState<{
    bookingId: string;
    paymentReference: string;
    status: string;
    expiresAt: string;
    paymentAmount?: number;
    venmoAddress?: string;
  } | null>(null);
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [venmoAddress, setVenmoAddress] = useState('');
  const [submittingPayment, setSubmittingPayment] = useState(false);
  const [bookingCreated, setBookingCreated] = useState(false);

  const sessionId = searchParams.get('sessionId') || '';

  const baseRate = session?.rate || '';
  const tutorName = session?.tutorName || '';
  const displayRate = baseRate && baseRate !== '' ? (calculateDisplayRate(baseRate) || '0') : '0';
  const displayRateNum = parseInt(displayRate, 10) || 0;
  const totalAmount = Math.max(0, displayRateNum);

  // Load session details and automatically create booking (since they already booked on Google Calendar)
  useEffect(() => {
    const load = async () => {
      if (!sessionId) {
        router.push('/');
        return;
      }
      
      // Clear the pending payment session ID since we're now on the payment page
      sessionStorage.removeItem('pendingPaymentSessionId');
      
      try {
        const res = await fetch(`/api/payment-session?sessionId=${encodeURIComponent(sessionId)}`);
        if (!res.ok) {
          router.push('/');
          return;
        }
        const data = await res.json();
        if (!data?.success || !data?.tutorName) {
          router.push('/');
          return;
        }
        const sessionData = {
          tutorName: data.tutorName,
          tutorVenmo: data.tutorVenmo || '',
          rate: data.rate || '',
        };
        setSession(sessionData);

        // Automatically create booking since they already booked on Google Calendar
        if (!bookingCreated && !bookingStatus) {
          setBookingCreated(true);
          setIsLoading(true);
          try {
            // Calculate amount from rate
            const rate = sessionData.rate || '';
            const displayRate = rate && rate !== '' ? (calculateDisplayRate(rate) || '0') : '0';
            const displayRateNum = parseInt(displayRate, 10) || 0;
            const amount = Math.max(0, displayRateNum);

            // First, get the booking URL from the session via server-side API
            const sessionResponse = await fetch(`/api/payment-session/get-booking-url?sessionId=${encodeURIComponent(sessionId)}`);
            let bookingUrl = '';
            
            if (sessionResponse.ok) {
              const sessionUrlData = await sessionResponse.json();
              bookingUrl = sessionUrlData.bookingUrl || '';
            }

            // Create pending booking
            const bookingResponse = await fetch('/api/bookings', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                sessionId,
                tutorName: sessionData.tutorName,
                tutorVenmo: sessionData.tutorVenmo || '',
                rate: sessionData.rate || '',
                bookingUrl,
                amount,
              }),
            });

            if (bookingResponse.ok) {
              const bookingData = await bookingResponse.json();
              if (bookingData.success) {
                setBookingStatus({
                  bookingId: bookingData.bookingId,
                  paymentReference: bookingData.paymentReference,
                  status: bookingData.status,
                  expiresAt: bookingData.expiresAt,
                });
              }
            }
          } catch (error) {
            console.error('Error creating booking:', error);
          } finally {
            setIsLoading(false);
          }
        }
      } catch {
        router.push('/');
      }
    };
    load();
  }, [router, sessionId]);

  const handleCreateBooking = async () => {
    if (!sessionId) return;
    
    setIsLoading(true);
    
    try {
      // First, get the booking URL from the session via server-side API
      const sessionResponse = await fetch(`/api/payment-session/get-booking-url?sessionId=${encodeURIComponent(sessionId)}`);
      let bookingUrl = '';
      
      if (sessionResponse.ok) {
        const sessionData = await sessionResponse.json();
        bookingUrl = sessionData.bookingUrl || '';
      }

      // Create pending booking
      const bookingResponse = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          tutorName: session?.tutorName || '',
          tutorVenmo: session?.tutorVenmo || '',
          rate: session?.rate || '',
          bookingUrl,
          amount: totalAmount,
        }),
      });

      if (!bookingResponse.ok) {
        throw new Error('Failed to create booking');
      }

      const bookingData = await bookingResponse.json();
      
      if (bookingData.success) {
        setBookingStatus({
          bookingId: bookingData.bookingId,
          paymentReference: bookingData.paymentReference,
          status: bookingData.status,
          expiresAt: bookingData.expiresAt,
        });
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      alert('Failed to create booking. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Check booking status periodically
  useEffect(() => {
    if (!bookingStatus || !bookingStatus.bookingId) return;

    const checkStatus = async () => {
      // Don't check if already verified or expired - no redirect needed
      if (bookingStatus.status !== 'pending') {
        return;
      }

      setCheckingStatus(true);
      try {
        const response = await fetch(`/api/bookings?bookingId=${encodeURIComponent(bookingStatus.bookingId)}`);
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            if (data.booking.status === 'verified') {
              // Payment verified! Update status (no redirect)
              setBookingStatus((prev) => {
                if (!prev) return prev;
                return {
                  ...prev,
                  status: 'verified',
                };
              });
              return;
            } else if (data.booking.status !== bookingStatus.status) {
              // Update status if it changed (e.g., expired, rejected)
              setBookingStatus((prev) => {
                if (!prev) return prev;
                return {
                  ...prev,
                  status: data.booking.status,
                };
              });
            }
            // Update payment details if they exist
            if (data.booking.paymentAmount && !bookingStatus.paymentAmount) {
              setBookingStatus((prev) => {
                if (!prev) return prev;
                return {
                  ...prev,
                  paymentAmount: data.booking.paymentAmount,
                  venmoAddress: data.booking.venmoAddress,
                };
              });
            }
          }
        }
      } catch (error) {
        console.error('Error checking booking status:', error);
      } finally {
        setCheckingStatus(false);
      }
    };

    // Check immediately
    checkStatus();

    // Only set up interval if status is pending and payment details not yet submitted
    if (bookingStatus.status === 'pending' && !bookingStatus.paymentAmount) {
      // Check every 3 seconds (more frequent for better UX)
      const interval = setInterval(checkStatus, 3000);
      return () => clearInterval(interval);
    }
  }, [bookingStatus?.bookingId, bookingStatus?.status, sessionId]);

  // Venmo URL with tutor name autofilled in note
  const venmoNote = bookingStatus 
    ? bookingStatus.paymentReference // Tutor name
    : tutorName || 'Tutor Session';
  
  const peerpointVenmoUrl = `https://venmo.com/${PEERPOINT_VENMO}?txn=pay&amount=${totalAmount}&note=${encodeURIComponent(venmoNote)}`;

  const handleCopyCode = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch (e) {
      console.error('Failed to copy code:', e);
    }
  };

  const handleSubmitPaymentDetails = async () => {
    if (!paymentAmount.trim() || !venmoAddress.trim() || !bookingStatus) {
      alert('Please fill in all payment details.');
      return;
    }

    setSubmittingPayment(true);
    try {
      const response = await fetch('/api/bookings/submit-payment-details', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: bookingStatus.bookingId,
          paymentAmount: paymentAmount.trim(),
          venmoAddress: venmoAddress.trim(),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Update booking status to include payment details
          setBookingStatus((prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              paymentAmount: data.booking.paymentAmount,
              venmoAddress: data.booking.venmoAddress,
            };
          });
          // Clear the form
          setPaymentAmount('');
          setVenmoAddress('');
          // Redirect to main website page
          setTimeout(() => {
            window.location.href = '/';
          }, 500);
        } else {
          alert(data.message || 'Error submitting payment details. Please try again.');
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert(errorData.message || 'Error submitting payment details. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting payment details:', error);
      alert('Error submitting payment details. Please try again.');
    } finally {
      setSubmittingPayment(false);
    }
  };

  if (!sessionId || !session) {
    return null;
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
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-2xl px-6 py-12 md:px-16">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-900 transition mb-6"
        >
          <span className="text-sm leading-none">←</span>
          <span>Back to Home</span>
        </Link>
        <div className="mb-8">
          <h1 className="mb-2 text-2xl font-semibold text-neutral-900">
            Complete Your Payment
          </h1>
          <p className="text-sm text-neutral-600">
            Please complete payment for your tutoring session with {tutorName}
          </p>
        </div>

        {/* Payment Summary */}
        <div className="mb-6 rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="mb-4">
            <h2 className="mb-4 text-lg font-semibold text-neutral-900">
              Session Details
            </h2>
            <div className="space-y-2 text-sm text-neutral-700">
              <div className="flex justify-between">
                <span className="text-neutral-600">Tutor:</span>
                <span className="font-medium">{tutorName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600">Session Duration:</span>
                <span className="font-medium">1 hour</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600">Total Amount:</span>
                <span className="font-semibold text-neutral-900">${displayRate}</span>
              </div>
            </div>
          </div>

          <p className="border-t border-neutral-200 pt-4 text-xs text-neutral-500">
            After payment is verified by the tutor, you will be automatically redirected to the booking page.
          </p>
        </div>


        {/* Payment Instructions */}
        <div className="mb-6 rounded-lg border border-neutral-200 bg-neutral-50 p-6">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-neutral-700">
            Payment Instructions
          </h3>
          <ol className="space-y-3 text-sm text-neutral-700">
            <li className="flex gap-3">
              <span className="font-semibold text-neutral-900">1.</span>
              <span>
                Pay <span className="font-medium">${displayRate}</span> via Venmo
              </span>
            </li>
            <li className="flex gap-3">
              <span className="font-semibold text-neutral-900">2.</span>
              <span>
                Send payment to <span className="font-medium">@{PEERPOINT_VENMO}</span>
              </span>
            </li>
            <li className="flex gap-3">
              <span className="font-semibold text-neutral-900">3.</span>
              <span>The tutor&apos;s name will be automatically included in your Venmo payment note</span>
            </li>
            <li className="flex gap-3">
              <span className="font-semibold text-neutral-900">4.</span>
              <span>After payment, fill in the payment details form below</span>
            </li>
          </ol>
        </div>

        {/* Venmo Payment Button */}
        <div className="mb-6">
          <a
            href={peerpointVenmoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-lg border-2 border-teal-500 bg-teal-50 px-6 py-4 text-sm font-semibold text-teal-700 transition hover:bg-teal-100"
          >
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M19.5 3.5L18 2l-1.5 1.5L15 2l-1.5 1.5L12 2l-1.5 1.5L9 2 7.5 3.5 6 2v14H3v3c0 1.66 1.34 3 3 3h12c1.66 0 3-1.34 3-3V2l-1.5 1.5zM19 19c0 .55-.45 1-1 1s-1-.45-1-1v-3H8V5h11v14z" />
            </svg>
            Pay ${displayRate} to @{PEERPOINT_VENMO}
            {bookingStatus && (
              <span className="text-xs opacity-75">(Reference included)</span>
            )}
          </a>

          {bookingStatus ? (
            <div className="mt-4 rounded-lg border border-neutral-200 bg-white p-4">
              <div className="mb-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-700 mb-2">
                  Payment Reference
                </p>
                <p className="text-sm text-neutral-700 mb-3">
                  The tutor&apos;s name ({bookingStatus.paymentReference}) will be automatically included in your Venmo payment note when you click the Venmo button above.
                </p>
                <div className="flex items-center gap-3">
                  <p className="text-sm font-semibold text-neutral-900 bg-neutral-50 px-3 py-2 rounded border border-neutral-200">
                    {bookingStatus.paymentReference}
                  </p>
                  <button
                    type="button"
                    onClick={() => handleCopyCode(bookingStatus.paymentReference)}
                    className="shrink-0 rounded-full border border-neutral-300 bg-white px-3 py-2 text-xs font-semibold text-neutral-700 transition hover:bg-neutral-50"
                  >
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </div>
              
              <div className={`rounded-lg p-3 ${
                bookingStatus.status === 'verified' 
                  ? 'bg-green-50 border border-green-200' 
                  : bookingStatus.status === 'expired'
                  ? 'bg-red-50 border border-red-200'
                  : 'bg-yellow-50 border border-yellow-200'
              }`}>
                <p className={`text-xs font-semibold ${
                  bookingStatus.status === 'verified'
                    ? 'text-green-700'
                    : bookingStatus.status === 'expired'
                    ? 'text-red-700'
                    : 'text-yellow-700'
                }`}>
                  Status: {bookingStatus.status === 'verified' 
                    ? '✓ Payment Verified - Redirecting...' 
                    : bookingStatus.status === 'expired'
                    ? '✗ Booking Expired - Please create a new booking'
                    : bookingStatus.paymentAmount
                    ? '✓ Payment details submitted - Redirecting to booking...'
                    : checkingStatus
                    ? '⏳ Checking payment status...'
                    : '⏳ Submit your payment details above to proceed to booking'}
                </p>
                {bookingStatus.status === 'pending' && (
                  <p className="text-xs text-neutral-600 mt-1">
                    Submit your payment details below to proceed to booking.
                  </p>
                )}
                {bookingStatus.status === 'expired' && (
                  <p className="text-xs text-red-700 mt-1 font-semibold">
                    This booking has expired. The time slot has been released and is now available for other students to book.
                  </p>
                )}
                {bookingStatus.status === 'rejected' && (
                  <p className="text-xs text-red-700 mt-1 font-semibold">
                    This booking was rejected. The time slot has been released and is now available for other students to book.
                  </p>
                )}
              </div>

              {/* Payment Details Form */}
              {bookingStatus.status === 'pending' && !bookingStatus.paymentAmount && (
                <div className="mt-4 rounded-lg border border-neutral-200 bg-white p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-700 mb-2">
                    Payment Details
                  </p>
                  <p className="text-sm text-neutral-700 mb-4">
                    After completing your Venmo payment, please fill in the details below to proceed to booking:
                  </p>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-neutral-700 mb-1">
                        Payment Amount ($) *
                      </label>
                      <select
                        value={paymentAmount}
                        onChange={(e) => setPaymentAmount(e.target.value)}
                        className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
                        required
                      >
                        <option value="">Select payment amount</option>
                        <option value="17">$17</option>
                        <option value="22">$22</option>
                        <option value="27">$27</option>
                        <option value="33">$33</option>
                        <option value="38">$38</option>
                        <option value="44">$44</option>
                        <option value="49">$49</option>
                        <option value="55">$55</option>
                      </select>
                      <p className="text-xs text-neutral-500 mt-1">
                        Select the exact amount you paid (should match ${displayRate})
                      </p>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-neutral-700 mb-1">
                        Your Venmo Username/Address *
                      </label>
                      <input
                        type="text"
                        value={venmoAddress}
                        onChange={(e) => setVenmoAddress(e.target.value)}
                        placeholder="@yourvenmo or yourvenmo"
                        className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
                        required
                      />
                      <p className="text-xs text-neutral-500 mt-1">
                        The exact Venmo username/phone number you used to send the payment
                      </p>
                    </div>
                    <button
                      onClick={handleSubmitPaymentDetails}
                      disabled={!paymentAmount.trim() || !venmoAddress.trim() || submittingPayment}
                      className="w-full rounded-full bg-neutral-900 px-6 py-2 text-sm font-semibold text-white transition hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submittingPayment ? 'Submitting...' : 'Submit Payment Details'}
                    </button>
                    <p className="text-xs text-neutral-500 text-center">
                      After submitting your payment details, you&apos;ll be redirected to complete your booking. 
                      An admin may verify your payment later and can reject the appointment if payment is not received.
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="mt-4 rounded-lg border border-neutral-200 bg-neutral-50 p-4">
              <p className="text-sm text-neutral-700">
                {isLoading ? 'Setting up your payment...' : 'Loading payment details...'}
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-neutral-600">Loading...</p>
      </div>
    }>
      <PaymentPageContent />
    </Suspense>
  );
}
