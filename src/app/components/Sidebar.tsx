'use client';

interface Company {
  cik: string;
  name: string;
  ticker: string;
}

interface SidebarProps {
  activePage: string;
  setActivePage: (page: string) => void;
  company: Company;
}

export default function Sidebar({ activePage, setActivePage, company }: SidebarProps) {
  const navItems = ['Dashboard', 'Financials', 'Operating Model', 'Company Filings'];

  return (
    <aside className="w-64 bg-gray-900 text-white flex flex-col">
      <div className="p-6 border-b border-gray-800">
        <h1 className="text-2xl font-bold">SG&A</h1>
        <p className="text-sm text-gray-400 mt-1">Financial Dashboard</p>
        <p className="text-xs text-gray-500 mt-2">{company.ticker}</p>
      </div>
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item}>
              <button
                onClick={() => setActivePage(item)}
                className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                  activePage === item
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                {item}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}

