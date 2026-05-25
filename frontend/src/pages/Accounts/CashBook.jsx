import React, { useState } from 'react';
import { FiCalendar, FiDownload } from 'react-icons/fi';

const CashBook = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [cashData, setCashData] = useState({
    date: new Date().toISOString().split('T')[0],
    openingBalance: 25000,
    collections: [
      { source: 'Seva Bookings', amount: 45000 },
      { source: 'Donations', amount: 78500 },
      { source: 'Prasada Sales', amount: 12500 },
      { source: 'Room Bookings', amount: 8000 }
    ],
    expenses: [
      { category: 'Prasada Ingredients', amount: 5000 },
      { category: 'Staff Salary', amount: 15000 },
      { category: 'Maintenance', amount: 3000 },
      { category: 'Electricity', amount: 2000 }
    ]
  });

  const totalCollection = cashData.collections.reduce((sum, item) => sum + item.amount, 0);
  const totalExpense = cashData.expenses.reduce((sum, item) => sum + item.amount, 0);
  const closingBalance = cashData.openingBalance + totalCollection - totalExpense;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b bg-gradient-to-r from-orange-50 to-white flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Cash Book</h1>
            <p className="text-gray-600 mt-1">Daily cash flow statement</p>
          </div>
          <div className="flex space-x-3">
            <div className="flex items-center space-x-2">
              <FiCalendar className="text-gray-500" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-md"
              />
            </div>
            <button className="px-4 py-1 border border-gray-300 rounded-md hover:bg-gray-50 flex items-center">
              <FiDownload className="mr-2" /> Export
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Balance Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-blue-600">Opening Balance</p>
              <p className="text-2xl font-bold text-blue-700">₹{cashData.openingBalance.toLocaleString()}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-sm text-green-600">Total Collection</p>
              <p className="text-2xl font-bold text-green-700">₹{totalCollection.toLocaleString()}</p>
            </div>
            <div className="bg-red-50 rounded-lg p-4">
              <p className="text-sm text-red-600">Total Expenses</p>
              <p className="text-2xl font-bold text-red-700">₹{totalExpense.toLocaleString()}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Collections */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">Collections (Income)</h3>
              <table className="w-full">
                <tbody className="divide-y divide-gray-200">
                  {cashData.collections.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="py-2 text-gray-700">{item.source}</td>
                      <td className="py-2 text-right font-medium text-green-600">₹{item.amount.toLocaleString()}</td>
                     </tr>
                  ))}
                  <tr className="font-bold border-t-2">
                    <td className="py-2">Total Collections</td>
                    <td className="py-2 text-right text-green-700">₹{totalCollection.toLocaleString()}</td>
                   </tr>
                </tbody>
               </table>
            </div>

            {/* Expenses */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">Expenses (Payments)</h3>
              <table className="w-full">
                <tbody className="divide-y divide-gray-200">
                  {cashData.expenses.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="py-2 text-gray-700">{item.category}</td>
                      <td className="py-2 text-right font-medium text-red-600">₹{item.amount.toLocaleString()}</td>
                     </tr>
                  ))}
                  <tr className="font-bold border-t-2">
                    <td className="py-2">Total Expenses</td>
                    <td className="py-2 text-right text-red-700">₹{totalExpense.toLocaleString()}</td>
                   </tr>
                </tbody>
               </table>
            </div>
          </div>

          {/* Closing Balance */}
          <div className="mt-6 p-4 bg-orange-50 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-gray-800">Closing Balance</span>
              <span className="text-2xl font-bold text-orange-600">₹{closingBalance.toLocaleString()}</span>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Opening Balance + Total Collection - Total Expenses
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CashBook;