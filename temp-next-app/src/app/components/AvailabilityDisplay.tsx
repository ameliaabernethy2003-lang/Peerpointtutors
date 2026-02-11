'use client';

import { useState, useEffect } from 'react';

interface AvailabilityDisplayProps {
  bookingUrl: string;
  tutorName: string;
}

interface TimeSlot {
  date: string;
  time: string;
  available: boolean;
}

export default function AvailabilityDisplay({ bookingUrl, tutorName }: AvailabilityDisplayProps) {
  const [availability, setAvailability] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!bookingUrl) {
      setLoading(false);
      return;
    }

    // Fetch availability from our API
    fetch(`/api/tutor-availability?bookingUrl=${encodeURIComponent(bookingUrl)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.availability) {
          setAvailability(data.availability);
        } else {
          setError(data.error || 'Unable to load availability');
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching availability:', err);
        setError('Unable to load availability');
        setLoading(false);
      });
  }, [bookingUrl]);

  if (loading) {
    return (
      <div className="mt-3 rounded-lg border border-neutral-200 bg-neutral-50 p-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500 mb-2">
          Availability
        </p>
        <div className="flex items-center gap-2 text-xs text-neutral-500">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-900"></div>
          <span>Loading availability...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-3 rounded-lg border border-neutral-200 bg-neutral-50 p-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500 mb-2">
          Availability
        </p>
        <p className="text-xs text-neutral-500">
          Availability will be shown after payment
        </p>
      </div>
    );
  }

  if (availability.length === 0) {
    return (
      <div className="mt-3 rounded-lg border border-neutral-200 bg-neutral-50 p-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500 mb-2">
          Availability
        </p>
        <p className="text-xs text-neutral-500">
          No upcoming availability shown. Book after payment to see times.
        </p>
      </div>
    );
  }

  // Group by date
  const groupedByDate: Record<string, TimeSlot[]> = {};
  availability.forEach((slot) => {
    if (!groupedByDate[slot.date]) {
      groupedByDate[slot.date] = [];
    }
    groupedByDate[slot.date].push(slot);
  });

  const dates = Object.keys(groupedByDate).sort();

  return (
    <div className="mt-3 rounded-lg border border-neutral-200 bg-neutral-50 p-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500 mb-2">
        Upcoming Availability
      </p>
      <div className="space-y-2">
        {dates.slice(0, 3).map((date) => (
          <div key={date} className="text-xs">
            <p className="font-medium text-neutral-700 mb-1">{date}</p>
            <div className="flex flex-wrap gap-1">
              {groupedByDate[date]
                .filter((slot) => slot.available)
                .slice(0, 4)
                .map((slot, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center rounded border border-green-200 bg-green-50 px-2 py-0.5 text-[10px] font-medium text-green-700"
                  >
                    {slot.time}
                  </span>
                ))}
              {groupedByDate[date].filter((slot) => slot.available).length > 4 && (
                <span className="inline-flex items-center rounded border border-neutral-200 bg-white px-2 py-0.5 text-[10px] text-neutral-600">
                  +{groupedByDate[date].filter((slot) => slot.available).length - 4} more
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
      <p className="mt-2 text-[10px] text-neutral-500">
        Complete payment to book a session
      </p>
    </div>
  );
}

