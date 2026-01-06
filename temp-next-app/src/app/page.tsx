'use client';

import { useState } from 'react';
import Sidebar from './components/Sidebar';
import DebtPricingChart from './components/DebtPricingChart';
import CapitalStructureChart from './components/CapitalStructureChart';
import CompatibleCompaniesTable from './components/CompatibleCompaniesTable';

export default function Home() {
  const [activePage, setActivePage] = useState('Dashboard');

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar activePage={activePage} setActivePage={setActivePage} />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">{activePage}</h1>
          
          {activePage === 'Dashboard' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Debt Pricing Chart */}
              <div className="bg-white rounded-lg border-2 border-blue-200 p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Debt Pricing</h2>
                <DebtPricingChart />
              </div>

              {/* Capital Structure Chart */}
              <div className="bg-white rounded-lg border-2 border-blue-200 p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Capital Structure</h2>
                <CapitalStructureChart />
              </div>

              {/* Compatible Companies Table */}
              <div className="bg-white rounded-lg border-2 border-blue-200 p-6 shadow-sm lg:col-span-2">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Compatible Companies</h2>
                <CompatibleCompaniesTable />
              </div>
            </div>
          )}

          {activePage === 'Capital Structure' && (
            <div className="bg-white rounded-lg border-2 border-blue-200 p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Capital Structure Analysis</h2>
              <CapitalStructureChart />
            </div>
          )}

          {activePage === 'Financials' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg border-2 border-blue-200 p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Financial Overview</h2>
                <p className="text-gray-600">Financial data will be displayed here.</p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
