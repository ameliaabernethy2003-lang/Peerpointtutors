'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const data = [
  { category: 'Equity', amount: 45 },
  { category: 'Senior Debt', amount: 30 },
  { category: 'Mezzanine', amount: 15 },
  { category: 'Preferred', amount: 10 },
];

export default function CapitalStructureChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis 
          dataKey="category" 
          stroke="#6b7280"
          style={{ fontSize: '12px' }}
        />
        <YAxis 
          stroke="#6b7280"
          style={{ fontSize: '12px' }}
          label={{ value: 'Percentage (%)', angle: -90, position: 'insideLeft' }}
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: '#fff', 
            border: '1px solid #e5e7eb',
            borderRadius: '6px'
          }}
        />
        <Legend />
        <Bar 
          dataKey="amount" 
          fill="#3b82f6" 
          radius={[4, 4, 0, 0]}
          name="Percentage (%)"
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

