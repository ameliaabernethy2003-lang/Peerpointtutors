'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const data = [
  { month: 'Jan', rate: 3.2 },
  { month: 'Feb', rate: 3.4 },
  { month: 'Mar', rate: 3.5 },
  { month: 'Apr', rate: 3.7 },
  { month: 'May', rate: 3.6 },
  { month: 'Jun', rate: 3.8 },
  { month: 'Jul', rate: 4.0 },
  { month: 'Aug', rate: 4.1 },
  { month: 'Sep', rate: 4.2 },
  { month: 'Oct', rate: 4.3 },
  { month: 'Nov', rate: 4.4 },
  { month: 'Dec', rate: 4.5 },
];

export default function DebtPricingChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis 
          dataKey="month" 
          stroke="#6b7280"
          style={{ fontSize: '12px' }}
        />
        <YAxis 
          stroke="#6b7280"
          style={{ fontSize: '12px' }}
          label={{ value: 'Interest Rate (%)', angle: -90, position: 'insideLeft' }}
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: '#fff', 
            border: '1px solid #e5e7eb',
            borderRadius: '6px'
          }}
        />
        <Legend />
        <Line 
          type="monotone" 
          dataKey="rate" 
          stroke="#3b82f6" 
          strokeWidth={2}
          dot={{ fill: '#3b82f6', r: 4 }}
          name="Debt Rate (%)"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

