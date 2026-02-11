'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to search page if no company is selected
    const storedCompany = sessionStorage.getItem('selectedCompany');
    if (storedCompany) {
      router.push('/dashboard');
    } else {
      router.push('/search');
    }
  }, [router]);

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  );
}

