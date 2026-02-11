'use client';

const companies = [
  { name: 'Patagonia', sector: 'Outdoor Apparel', marketCap: '$3.0B', debtRatio: '0.15', rating: 'A+' },
  { name: 'The North Face (VF Corp)', sector: 'Outdoor Apparel', marketCap: '$5.2B', debtRatio: '0.28', rating: 'A' },
  { name: 'Columbia Sportswear', sector: 'Outdoor Apparel', marketCap: '$4.8B', debtRatio: '0.22', rating: 'A+' },
  { name: 'Deckers Outdoor', sector: 'Footwear & Apparel', marketCap: '$12.5B', debtRatio: '0.18', rating: 'AA-' },
  { name: 'Peloton', sector: 'Fitness Equipment', marketCap: '$1.5B', debtRatio: '0.45', rating: 'B+' },
  { name: 'Lululemon', sector: 'Athletic Apparel', marketCap: '$38.2B', debtRatio: '0.12', rating: 'AA' },
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

