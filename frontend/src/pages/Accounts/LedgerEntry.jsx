import React, { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { FiPlus, FiSearch } from 'react-icons/fi';
import api from '../../services/api';

const LedgerEntry = () => {
  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  const [entries, setEntries] = useState([]);
  const [balance, setBalance] = useState(0);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const transactionTypes = useMemo(
    () => ['Seva Booking', 'Donation', 'Prasada Sale', 'Room Booking', 'Expense', 'Salary'],
    []
  );

  useEffect(() => {
    const fetchLedger = async () => {
      try {
        setLoading(true);
        const res = await api.get('/ledger');
        // API returns array of ledger entries
        const list = Array.isArray(res?.data) ? res.data : res;
        setEntries(list);
        const last = list?.[list.length - 1];
        setBalance(last?.balance ?? 0);
      } catch (err) {
        toast.error(err?.message || 'Failed to load ledger');
      } finally {
        setLoading(false);
      }
    };

    fetchLedger();
  }, [api]);

  const onSubmit = async (data) => {
    try {
      const payload = {
        date: data.date,
        transactionType: data.transactionType,
        debit: data.debit ? Number(data.debit) : 0,
        credit: data.credit ? Number(data.credit) : 0,
        description: data.description
      };

      const res = await api.post('/ledger', payload);
      // backend returns: { ledger: created, account: createdAccount }
      const created = res?.data?.ledger ?? res?.data ?? res;

      setEntries((prev) => {
        const next = [...prev, created].sort((a, b) => {
          const da = new Date(a.date || a.createdAt).getTime();
          const db = new Date(b.date || b.createdAt).getTime();
          return da - db;
        });
        return next;
      });

      setBalance(created?.balance ?? balance);
      toast.success('Ledger entry added successfully!');
      reset();
    } catch (err) {
      toast.error(err?.message || 'Failed to add ledger entry');
    }
  };

  const filteredEntries = filter
    ? entries.filter(entry => (entry.transactionType || '').toLowerCase().includes(filter.toLowerCase()))
    : entries;


  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b bg-gradient-to-r from-orange-50 to-white">
          <h1 className="text-2xl font-bold text-gray-800">Ledger Entry</h1>
          <p className="text-gray-600 mt-1">Manage all financial transactions</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 border-b">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date *</label>
              <input
                type="date"
                {...register('date', { required: 'Date is required' })}
                defaultValue={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Transaction Type *</label>
              <select
                {...register('transactionType', { required: 'Transaction type is required' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">Select Type</option>
                {transactionTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Debit Amount (₹)</label>
              <input
                type="number"
                {...register('debit')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Income/Receipt"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Credit Amount (₹)</label>
              <input
                type="number"
                {...register('credit')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Expense/Payment"
              />
            </div>

            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
              <input
                type="text"
                {...register('description', { required: 'Description is required' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Enter description"
              />
            </div>
          </div>

          <div className="flex justify-end mt-4">
            <button
              type="submit"
              className="px-6 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 flex items-center"
            >
              <FiPlus className="mr-2" /> Add Entry
            </button>
          </div>
        </form>

        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Ledger Entries</h2>
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search transactions..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Transaction Type</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Debit (₹)</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Credit (₹)</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Balance (₹)</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredEntries.map((entry) => (
                  <tr key={entry.id || entry._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">{entry.date ? new Date(entry.date).toISOString().split('T')[0] : (entry.date || '')}</td>
                    <td className="px-4 py-3 text-sm">{entry.transactionType}</td>
                    <td className="px-4 py-3 text-sm text-right text-green-600">
                      {(Number(entry.debit) || 0) > 0 ? `₹${Number(entry.debit).toLocaleString()}` : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-red-600">
                      {(Number(entry.credit) || 0) > 0 ? `₹${Number(entry.credit).toLocaleString()}` : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-medium">₹{Number(entry.balance || 0).toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm">{entry.description}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50 font-bold">
                <tr>
                  <td colSpan="4" className="px-4 py-3 text-right">Current Balance:</td>
                  <td className="px-4 py-3 text-right">₹{balance.toLocaleString()}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LedgerEntry;