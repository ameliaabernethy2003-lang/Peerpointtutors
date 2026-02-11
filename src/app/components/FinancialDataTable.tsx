'use client';

const financialData = [
  { year: '2024', revenue: 1830, netIncome: 176, margin: '9.6%' },
  { year: '2023', revenue: 1659, netIncome: 170, margin: '10.2%' },
  { year: '2022', revenue: 1595, netIncome: 90, margin: '5.6%' },
  { year: '2021', revenue: 1411, netIncome: 213, margin: '15.1%' },
  { year: '2020', revenue: 1092, netIncome: 156, margin: '14.3%' },
  { year: '2019', revenue: 914, netIncome: 50, margin: '5.5%' },
  { year: '2018', revenue: 779, netIncome: 58, margin: '7.4%' },
  { year: '2017', revenue: 639, netIncome: 15, margin: '2.3%' },
  { year: '2016', revenue: 819, netIncome: 49, margin: '6.0%' },
  { year: '2015', revenue: 469, netIncome: 74, margin: '15.8%' },
];

export default function FinancialDataTable() {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Year
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Revenue ($M)
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Net Income ($M)
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Net Margin
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {financialData.map((row, index) => (
            <tr key={index} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {row.year}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                ${row.revenue.toLocaleString()}M
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                ${row.netIncome.toLocaleString()}M
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  parseFloat(row.margin) >= 10 
                    ? 'bg-green-100 text-green-800' 
                    : parseFloat(row.margin) >= 5
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {row.margin}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

