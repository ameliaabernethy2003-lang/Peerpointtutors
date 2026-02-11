'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Company {
  cik: string;
  name: string;
  ticker: string;
}

export default function SearchPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const knownCompanies: { [key: string]: Company } = {
    'YETI': { cik: '0001670592', name: 'YETI Holdings, Inc.', ticker: 'YETI' },
    'yeti': { cik: '0001670592', name: 'YETI Holdings, Inc.', ticker: 'YETI' },
    'TSMC': { cik: '0001046179', name: 'Taiwan Semiconductor Manufacturing Company Limited', ticker: 'TSM' },
    'tsmc': { cik: '0001046179', name: 'Taiwan Semiconductor Manufacturing Company Limited', ticker: 'TSM' },
    'taiwan semiconductor': { cik: '0001046179', name: 'Taiwan Semiconductor Manufacturing Company Limited', ticker: 'TSM' },
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchTerm.trim()) {
      setError('Please enter a company name or ticker');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const searchKey = searchTerm.trim().toUpperCase();
      const searchKeyLower = searchTerm.trim().toLowerCase();
      
      // Check known companies first
      let company = knownCompanies[searchKey] || knownCompanies[searchKeyLower];
      
      // Check for partial matches
      if (!company) {
        for (const [key, comp] of Object.entries(knownCompanies)) {
          if (searchKey.includes(key.toUpperCase()) || searchKeyLower.includes(key.toLowerCase())) {
            company = comp;
            break;
          }
        }
      }

      // If not found in known companies, search SEC API
      if (!company) {
        const response = await fetch(`/api/sec-filings?company=${encodeURIComponent(searchTerm)}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Company not found');
        }

        company = data.company;
      }

      if (company) {
        // Store company in sessionStorage and navigate to dashboard
        sessionStorage.setItem('selectedCompany', JSON.stringify(company));
        router.push('/dashboard');
      } else {
        throw new Error('Company not found');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to find company. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-gray-900 mb-2">SG&A</h1>
          <p className="text-xl text-gray-600">Financial Dashboard</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
            Search for a Company
          </h2>
          
          <form onSubmit={handleSearch} className="space-y-4">
            <div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Enter company name or ticker (e.g., Yeti, YETI, TSMC)"
                className="w-full px-6 py-4 text-lg border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={loading}
                autoFocus
              />
            </div>
            
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-4 bg-blue-600 text-white text-lg font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Searching...
                </>
              ) : (
                'Search'
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600 text-center mb-3">Popular searches:</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {['YETI', 'TSMC'].map((ticker) => (
                <button
                  key={ticker}
                  onClick={() => {
                    setSearchTerm(ticker);
                    handleSearch({ preventDefault: () => {} } as React.FormEvent);
                  }}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm transition-colors"
                  disabled={loading}
                >
                  {ticker}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

