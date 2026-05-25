import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const DonationChart = ({ data }) => {
  const chartData = data.map(d => ({
    name: d.mode || 'General',
    amount: d.amount || 0,
    donor: d.donor,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="amount" fill="#8884d8" name="Donation Amount (₹)" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export { DonationChart };
export default DonationChart;
