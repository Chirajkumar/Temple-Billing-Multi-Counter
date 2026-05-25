import React, { useState, useEffect } from 'react';
import { FiCalendar, FiDownload, FiPrinter, FiAlertTriangle } from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { reportsAPI } from '../../services/api.js';
import LoadingSpinner from '../../components/Common/LoadingSpinner.jsx';
import toast from 'react-hot-toast';

const DailyReport = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Dynamic pie colors
  const pieColors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#F7DC6F'];

  useEffect(() => {
    fetchDailyReport();
  }, [selectedDate]);

  const fetchDailyReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await reportsAPI.getDailyReport(selectedDate);
      setReportData(data);
    } catch (err) {
      console.error('Failed to fetch daily report:', err);
      setError('Failed to load daily report data. Please try again.');
      toast.error('Failed to load daily report');
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  const handleExport = () => {
    if (!reportData || !reportData.counterWiseCollection.length) {
      toast.error('No data to export');
      return;
    }

    // Create CSV
    const headers = 'Counter,Transactions,Amount (₹)\n';
    const csvRows = reportData.counterWiseCollection
      .map(row => `${row.counter},"${row.transactions}",${row.amount}`)
      .join('\n');
    const csvContent = headers + csvRows + '\nTotal,"' + reportData.totalTransactions + '",' + reportData.totalCollection;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `daily-report-${selectedDate}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  // Dynamic pie data from real data
  const pieData = reportData?.counterWiseCollection?.map((item, index) => ({
    name: item.counter,
    value: item.amount,
    color: pieColors[index % pieColors.length]
  })) || [];

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6 p-12">
        <LoadingSpinner size="lg" message="Loading daily report..." />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="bg-white rounded-lg shadow print:shadow-none">
        <div className="px-6 py-4 border-b bg-gradient-to-r from-orange-50 to-white flex justify-between items-center print:bg-white">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 print:text-black">Daily Report</h1>
            <p className="text-gray-600 mt-1 print:text-black">
              {reportData ? `Date: ${new Date(reportData.date).toLocaleDateString()}` : 'Loading...'}
            </p>
          </div>
          <div className="flex space-x-3 print:hidden">
            <button 
              onClick={handleExport} 
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 flex items-center transition-colors"
              disabled={!reportData}
            >
              <FiDownload className="mr-2" /> Export CSV
            </button>
            <button 
              onClick={handlePrint} 
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 flex items-center transition-colors"
            >
              <FiPrinter className="mr-2" /> Print
            </button>
          </div>
        </div>

        <div className="p-6">
          {error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <FiAlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-red-800 mb-2">{error}</h3>
              <button
                onClick={fetchDailyReport}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Retry
              </button>
            </div>
          ) : reportData ? (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 print:grid-cols-2 print:gap-4">
                <div className="bg-green-50 rounded-lg p-4 print:bg-green-100">
                  <p className="text-sm text-green-600 font-medium">Total Collection</p>
                  <p className="text-2xl font-bold text-green-700 print:text-xl">
                    ₹{reportData.totalCollection?.toLocaleString() || 0}
                  </p>
                </div>
                <div className="bg-blue-50 rounded-lg p-4 print:bg-blue-100">
                  <p className="text-sm text-blue-600 font-medium">Transactions</p>
                  <p className="text-2xl font-bold text-blue-700 print:text-xl">
                    {reportData.totalTransactions || 0}
                  </p>
                </div>
                <div className="bg-purple-50 rounded-lg p-4 print:bg-purple-100">
                  <p className="text-sm text-purple-600 font-medium">Donations</p>
                  <p className="text-2xl font-bold text-purple-700 print:text-xl">
                    {reportData.donations || 0}
                  </p>
                </div>
                <div className="bg-orange-50 rounded-lg p-4 print:bg-orange-100">
                  <p className="text-sm text-orange-600 font-medium">Seva Bookings</p>
                  <p className="text-2xl font-bold text-orange-700 print:text-xl">
                    {reportData.sevas || 0}
                  </p>
                </div>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6 print:grid-cols-1 print:gap-4">
                <div>
                  <h3 className="text-lg font-semibold mb-3 print:mb-2">Counter-wise Collection</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={reportData.counterWiseCollection || []}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="counter" angle={-45} height={80} />
                      <YAxis />
                      <Tooltip formatter={(value) => [`₹${value.toLocaleString()}`, 'Amount']} />
                      <Legend />
                      <Bar dataKey="amount" fill="#FF6B6B" name="Amount (₹)" />
                      <Bar dataKey="transactions" fill="#4ECDC4" name="Transactions" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-3 print:mb-2">Collection Distribution</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Detailed Table */}
              <div className="print:break-inside-avoid">
                <h3 className="text-lg font-semibold mb-3 print:mb-2 print:text-xl">Counter-wise Details</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full border border-gray-200 print:border-2 print:border-black">
                    <thead className="bg-gray-50 print:bg-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider print:text-sm print:font-bold print:border print:border-gray-300">Counter</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider print:text-sm print:font-bold print:border print:border-gray-300">Transactions</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider print:text-sm print:font-bold print:border print:border-gray-300">Amount (₹)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 print:divide-gray-400">
                      {reportData.counterWiseCollection?.map((item, index) => (
                        <tr key={index} className="hover:bg-gray-50 print:hover:bg-transparent">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 print:text-base print:font-semibold">{item.counter}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right print:text-base">{item.transactions}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-semibold print:text-base print:font-bold">
                            ₹{item.amount?.toLocaleString() || 0}
                          </td>
                        </tr>
                      )) || (
                        <tr>
                          <td colSpan="3" className="px-6 py-4 text-center text-gray-500 text-sm">No data for selected date</td>
                        </tr>
                      )}
                      <tr className="bg-gray-50 font-bold print:bg-yellow-100 print:font-black">
                        <td className="px-6 py-4 text-sm font-bold print:text-lg">TOTAL</td>
                        <td className="px-6 py-4 text-sm text-right font-bold print:text-lg">
                          {reportData.totalTransactions || 0}
                        </td>
                        <td className="px-6 py-4 text-sm text-right font-bold text-green-700 print:text-xl print:text-green-900">
                          ₹{reportData.totalCollection?.toLocaleString() || 0}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No data available for selected date</p>
            </div>
          )}
        </div>

        {/* Date Selector - always visible */}
        <div className="p-6 bg-gray-50 border-t print:hidden">
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Date</label>
          <div className="flex gap-4 items-center">
            <input
              type="date"
              value={selectedDate}
              onChange={handleDateChange}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 flex-1 max-w-md"
              max={new Date().toISOString().split('T')[0]}
            />
            <button
              onClick={fetchDailyReport}
              className="px-6 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Refresh'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyReport;

