'use client';

import { useState, useEffect } from 'react';

interface Filing {
  form: string;
  filingDate: string;
  reportDate: string;
  accessionNumber: string;
  documentUrl: string;
  documentName: string;
}

interface Company {
  cik: string;
  name: string;
  ticker: string;
}

interface CompanyFilingsProps {
  company: Company;
}

export default function CompanyFilings({ company }: CompanyFilingsProps) {
  const [searchTerm, setSearchTerm] = useState(company.name);
  const [companyInfo, setCompanyInfo] = useState<Company | null>(company);
  const [filings, setFilings] = useState<Filing[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load filings when component mounts or company changes
    if (company) {
      loadFilings(company.name);
    }
  }, [company]);

  const loadFilings = async (companyName: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/sec-filings?company=${encodeURIComponent(companyName)}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch filings');
      }

      setCompanyInfo(data.company);
      setFilings(data.filings);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch company filings');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchTerm.trim()) {
      setError('Please enter a company name');
      return;
    }

    await loadFilings(searchTerm);
  };

  const handleDownload = (url: string, fileName: string) => {
    // Open PDF in new tab for download
    window.open(url, '_blank');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="space-y-6">
      {/* Company Info Header */}
      <div className="bg-white rounded-lg border-2 border-blue-200 p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Company Filings</h2>
        <p className="text-sm text-gray-600 mb-4">
          View and download SEC filings for {company.name} ({company.ticker})
        </p>
        {loading && (
          <div className="flex items-center gap-2 text-blue-600">
            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Loading filings...
          </div>
        )}
        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}
      </div>

      {/* Company Info and Filings */}
      {companyInfo && (
        <div className="bg-white rounded-lg border-2 border-blue-200 p-6 shadow-sm">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-800">{companyInfo.name}</h3>
            {companyInfo.ticker && (
              <p className="text-sm text-gray-600">Ticker: {companyInfo.ticker} | CIK: {companyInfo.cik}</p>
            )}
          </div>

          {filings.length === 0 ? (
            <p className="text-gray-600">No 10-K or 10-Q filings found for the last 8 years.</p>
          ) : (
            <div>
              <h4 className="text-md font-semibold text-gray-800 mb-4">
                Filings ({filings.length} found)
              </h4>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Form Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Filing Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Report Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Document
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filings.map((filing, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            filing.form === '10-K' 
                              ? 'bg-blue-100 text-blue-800' 
                              : filing.form === '20-F'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {filing.form}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(filing.filingDate)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(filing.reportDate)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {filing.documentName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button
                            onClick={() => handleDownload(filing.documentUrl, filing.documentName)}
                            className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-2"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Download PDF
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
}

