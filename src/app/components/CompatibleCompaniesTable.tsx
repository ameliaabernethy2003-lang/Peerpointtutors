'use client';

const companies = [
  { name: 'Acme Realty Group', sector: 'Commercial', marketCap: '$2.5B', debtRatio: '0.35', rating: 'A+' },
  { name: 'Metro Properties Inc', sector: 'Residential', marketCap: '$1.8B', debtRatio: '0.42', rating: 'A' },
  { name: 'Urban Development Co', sector: 'Mixed Use', marketCap: '$3.2B', debtRatio: '0.38', rating: 'A+' },
  { name: 'Coastal Real Estate', sector: 'Hospitality', marketCap: '$1.2B', debtRatio: '0.45', rating: 'A-' },
  { name: 'Prime Holdings LLC', sector: 'Commercial', marketCap: '$4.1B', debtRatio: '0.32', rating: 'AA-' },
  { name: 'Summit Properties', sector: 'Residential', marketCap: '$2.9B', debtRatio: '0.40', rating: 'A' },
];

export default function CompatibleCompaniesTable() {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Company Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Sector
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Market Cap
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Debt Ratio
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Rating
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {companies.map((company, index) => (
            <tr key={index} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {company.name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {company.sector}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {company.marketCap}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {company.debtRatio}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                  {company.rating}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

