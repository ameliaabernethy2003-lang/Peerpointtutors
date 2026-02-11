'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '../components/Sidebar';
import FinancialDataChart from '../components/FinancialDataChart';
import FinancialDataTable from '../components/FinancialDataTable';
import DownloadFinancialsButton from '../components/DownloadFinancialsButton';
import DownloadOperatingModelButton from '../components/DownloadOperatingModelButton';
import CompanyFilings from '../components/CompanyFilings';
import CompanyNews from '../components/CompanyNews';
import CompanyOverview from '../components/CompanyOverview';
import { useCompany } from '../components/CompanyContext';

export default function DashboardPage() {
  const [activePage, setActivePage] = useState('Dashboard');
  const { company, setCompany } = useCompany();
  const router = useRouter();

  useEffect(() => {
    // Load company from sessionStorage on mount
    const storedCompany = sessionStorage.getItem('selectedCompany');
    if (storedCompany) {
      try {
        const companyData = JSON.parse(storedCompany);
        setCompany(companyData);
      } catch (e) {
        console.error('Failed to parse stored company:', e);
        router.push('/search');
      }
    } else {
      // If no company selected, redirect to search
      router.push('/search');
    }
  }, [setCompany, router]);

  if (!company) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Loading company data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar activePage={activePage} setActivePage={setActivePage} company={company} />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{activePage}</h1>
              <p className="text-sm text-gray-600 mt-1">{company.name} ({company.ticker})</p>
            </div>
            <div className="flex items-center gap-4">
              <Link 
                href="/search" 
                className="text-sm text-gray-600 hover:text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Change Company
              </Link>
              <Link 
                href="/logout" 
                className="text-sm text-gray-600 hover:text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Logout
              </Link>
            </div>
          </div>
          
          {activePage === 'Dashboard' && (
            <div className="grid grid-cols-1 gap-6">
              {/* Company Overview */}
              <CompanyOverview company={company} />
              
              {/* Company News */}
              <CompanyNews company={company} />
            </div>
          )}

          {activePage === 'Financials' && (
            <div className="space-y-6">
              {/* Download Button */}
              <div className="bg-white rounded-lg border-2 border-blue-200 p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Download Financial Statements</h2>
                <p className="text-sm text-gray-600 mb-4">
                  Download a comprehensive three-statement model (Income Statement, Balance Sheet, Cash Flow Statement) 
                  for the last 5 years (2020-2024) in Excel format. Data sourced from SEC filings.
                </p>
                <DownloadFinancialsButton />
              </div>

              {/* Revenue and Net Income Chart */}
              <div className="bg-white rounded-lg border-2 border-blue-200 p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Revenue & Net Income (2015-2024)</h2>
                <p className="text-sm text-gray-600 mb-4">Historical financial performance data from SEC filings</p>
                <FinancialDataChart />
              </div>

              {/* Financial Data Table */}
              <div className="bg-white rounded-lg border-2 border-blue-200 p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Annual Financial Summary</h2>
                <FinancialDataTable />
              </div>
            </div>
          )}

          {activePage === 'Operating Model' && (
            <div className="space-y-6">
              {/* Operating Model Download */}
              <div className="bg-white rounded-lg border-2 border-blue-200 p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Download Operating Model</h2>
                <p className="text-sm text-gray-600 mb-4">
                  Download a comprehensive operating model with three-statement financial model (Income Statement, 
                  Balance Sheet, Statement of Cash Flows) for 6 full years up to the current year in Excel format. 
                  All data extracted directly from SEC 10-K filings with exact values (no rounding).
                </p>
                <DownloadOperatingModelButton company={company} />
              </div>

              {/* Information Card */}
              <div className="bg-white rounded-lg border-2 border-blue-200 p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">About the Operating Model</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• <strong>6 Years of Data:</strong> Complete financial history for the last 6 full years</li>
                  <li>• <strong>Three Statements:</strong> Income Statement, Balance Sheet, and Cash Flow Statement</li>
                  <li>• <strong>Exact SEC Values:</strong> All numbers match SEC 10-K filings exactly (no rounding)</li>
                  <li>• <strong>Annual Data Only:</strong> Full-year annual figures from 10-K reports</li>
                  <li>• <strong>Data Source:</strong> SEC EDGAR Database (CIK: {company.cik})</li>
                </ul>
              </div>
            </div>
          )}

          {activePage === 'Company Filings' && (
            <CompanyFilings company={company} />
          )}
        </div>
      </main>
    </div>
  );
}

