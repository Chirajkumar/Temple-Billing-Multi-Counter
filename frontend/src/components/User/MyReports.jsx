import React, { useState, useEffect } from 'react';
import { FiX, FiDownload, FiBarChart3, FiDollarSign, FiCalendar, FiUser } from 'react-icons/fi';
import { usersAPI } from '../../services/api.js';
import DonationChart from '../Charts/DonationChart.jsx';
import DataTable from '../Common/DataTable.jsx';
import LoadingSpinner from '../Common/LoadingSpinner.jsx';
import ConfirmDialog from '../Common/ConfirmDialog.jsx';

const MyReports = ({ isOpen, onClose }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [recentTransactions, setRecentTransactions] = useState([]);

  useEffect(() => {
    if (isOpen) {
      fetchReports();
    }
  }, [isOpen]);

  const fetchReports = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await usersAPI.getMyReports();
      setData(response);
      setRecentTransactions(response.recentTransactions || []);
    } catch (err) {
      setError('Failed to fetch reports data');
      console.error('Reports error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (format) => {
    // Simple CSV download stub - enhance with real data later
    const csvContent = 'Date,Type,Amount,Counter\\n2024-01-15,Donation,5000,Main\\n';
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `my-reports-${new Date().toISOString().split('T')[0]}.${format}`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const columns = [
    { key: 'date', label: 'Date', render: (row) => new Date(row.date).toLocaleDateString() },
    { key: 'type', label: 'Type' },
    { key: 'amount', label: 'Amount', render: (row) => `₹${row.amount.toLocaleString()}` },
    { key: 'counter', label: 'Counter' },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-6xl max-h-[90vh] w-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <FiBarChart3 className="w-8 h-8 text-blue-600" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">My Reports</h2>
              <p className="text-sm text-gray-500">Your personal transaction summary</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col">
          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <LoadingSpinner />
            </div>
          ) : error ? (
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="text-center">
                <FiBarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-900 mb-2">{error}</p>
                <button
                  onClick={fetchReports}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Stats Cards */}
              <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-blue-100">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-blue-100 rounded-xl">
                        <FiDollarSign className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                        <p className="text-2xl font-bold text-gray-900">₹{data?.totalRevenue?.toLocaleString() || 0}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-green-100">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-green-100 rounded-xl">
                        <FiUser className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Donations</p>
                        <p className="text-2xl font-bold text-gray-900">{data?.donations || 0}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-purple-100">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-purple-100 rounded-xl">
                        <FiCalendar className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Seva Bookings</p>
                        <p className="text-2xl font-bold text-gray-900">{data?.sevas || 0}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-orange-100">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-orange-100 rounded-xl">
                        <FiCalendar className="w-6 h-6 text-orange-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Period</p>
                        <p className="text-2xl font-bold text-gray-900">This Month</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 flex-1 overflow-auto space-y-6">
                {/* Chart */}
                <div className="bg-white rounded-xl shadow-sm border p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    Revenue Trend <FiBarChart3 className="w-5 h-5" />
                  </h3>
                  <div className="h-64">
                    <DonationChart data={[{ label: 'Donations', value: data?.totalRevenue || 0 }]} />
                  </div>
                </div>

                {/* Recent Transactions */}
                <div className="bg-white rounded-xl shadow-sm border">
                  <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Recent Transactions</h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowConfirm(true)}
                        className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                      >
                        <FiDownload className="w-4 h-4" />
                        CSV
                      </button>
                      <button
                        onClick={() => handleDownload('pdf')}
                        className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                      >
                        <FiDownload className="w-4 h-4" />
                        PDF
                      </button>
                    </div>
                  </div>
                  <div className="overflow-auto">
                    <DataTable
                      columns={columns}
                      data={recentTransactions}
                      emptyMessage="No recent transactions found"
                      pageSize={10}
                    />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {showConfirm && (
        <ConfirmDialog
          title="Download CSV Report"
          message="Download your reports as CSV file?"
          onConfirm={() => {
            handleDownload('csv');
            setShowConfirm(false);
          }}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </div>
  );
};

export default MyReports;

