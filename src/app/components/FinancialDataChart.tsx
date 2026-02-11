'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const financialData = [
  { year: '2015', revenue: 469, netIncome: 74 },
  { year: '2016', revenue: 819, netIncome: 49 },
  { year: '2017', revenue: 639, netIncome: 15 },
  { year: '2018', revenue: 779, netIncome: 58 },
  { year: '2019', revenue: 914, netIncome: 50 },
  { year: '2020', revenue: 1092, netIncome: 156 },
  { year: '2021', revenue: 1411, netIncome: 213 },
  { year: '2022', revenue: 1595, netIncome: 90 },
  { year: '2023', revenue: 1659, netIncome: 170 },
  { year: '2024', revenue: 1830, netIncome: 176 },
];

export default function FinancialDataChart() {
  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={financialData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis 
          dataKey="year" 
          stroke="#6b7280"
          style={{ fontSize: '12px' }}
        />
        <YAxis 
          stroke="#6b7280"
          style={{ fontSize: '12px' }}
          label={{ value: 'Amount ($M)', angle: -90, position: 'insideLeft' }}
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: '#fff', 
            border: '1px solid #e5e7eb',
            borderRadius: '6px'
          }}
          formatter={(value: number | undefined) => value !== undefined ? `$${value.toLocaleString()}M` : ''}
        />
        <Legend />
        <Line 
          type="monotone" 
          dataKey="revenue" 
          stroke="#3b82f6" 
          strokeWidth={2}
          dot={{ fill: '#3b82f6', r: 4 }}
          name="Revenue ($M)"
        />
        <Line 
          type="monotone" 
          dataKey="netIncome" 
          stroke="#10b981" 
          strokeWidth={2}
          dot={{ fill: '#10b981', r: 4 }}
          name="Net Income ($M)"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

