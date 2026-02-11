'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Get password from environment variable or use default
    // In production, this should be set in .env.local
    const correctPassword = process.env.NEXT_PUBLIC_DASHBOARD_PASSWORD || 'yeti2024';
    
    if (password === correctPassword) {
      // Set authentication cookie (24 hours)
      document.cookie = 'dashboard-auth=authenticated; path=/; max-age=86400';
      router.push('/search');
      router.refresh();
    } else {
      setError('Incorrect password');
      setPassword('');
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gray-50">
      <div className="bg-white rounded-lg border-2 border-blue-200 p-8 shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">SG&A</h1>
        <p className="text-sm text-gray-600 mb-6">Please enter the password to access</p>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter password"
              required
              autoFocus
            />
          </div>
          {error && (
            <div className="mb-4 text-sm text-red-600">{error}</div>
          )}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}

