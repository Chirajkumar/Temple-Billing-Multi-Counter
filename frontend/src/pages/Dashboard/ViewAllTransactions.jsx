import React, { useEffect, useMemo, useState, useCallback } from 'react';

import { FiCalendar, FiSearch } from 'react-icons/fi';
import DataTable from '../../components/Common/DataTable';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import AlertMessage from '../../components/Common/AlertMessage';
import { dashboardAPI } from '../../services/api';

const ViewAllTransactions = () => {

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState([]);

  const [page, setPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [search, setSearch] = useState('');

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const resp = await dashboardAPI.getAllTransactions({
        page,
        limit: itemsPerPage,
        search: search || undefined
      });

      setData(resp?.transactions || resp?.data || []);
    } catch (e) {
      console.error('Fetch transactions error:', e);
      setError('Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  }, [page, itemsPerPage, search]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const columns = useMemo(
    () => [
      {
        key: 'type',
        header: 'Type',
        render: (value) => (
          <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-800 text-xs font-medium">
            {(value || '').toUpperCase()}
          </span>
        )
      },
      {
        key: 'amount',
        header: 'Amount',
        render: (value) => (
          <span className="font-bold text-green-600">₹{Number(value || 0).toLocaleString()}</span>
        )
      },
      {
        key: 'date',
        header: 'Date',
        render: (value) => (
          <div className="flex items-center text-sm text-gray-700">
            <FiCalendar className="mr-2 h-4 w-4 text-gray-400" />
            <span>{value || ''}</span>
          </div>
        )
      },
      {
        key: 'status',
        header: 'Status',
        render: (value) => (
          <span className="px-2 py-1 rounded-full bg-blue-50 text-blue-800 text-xs font-medium">
            {(value || 'Completed').toUpperCase()}
          </span>
        )
      }
    ],
    []
  );

  if (loading) {
    return (
      <div className="p-6">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">View All Transactions</h1>
          <p className="text-sm text-gray-600 mt-1">Donations + Seva</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => {
                setPage(1);
                setSearch(e.target.value);
              }}
              placeholder="Search by type/description"
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
            />
          </div>

          <button
            onClick={() => {
              setPage(1);
              fetchTransactions();
            }}
            className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            Search
          </button>
        </div>
      </div>

      {error && <AlertMessage type="error" message={error} />}

      <div className="mt-4">
        <DataTable columns={columns} data={data} itemsPerPage={itemsPerPage} />
      </div>

      {/* DataTable has internal pagination; since our API is paginated,
          this page currently fetches one API page and DataTable paginates locally.
          This keeps UI working without a bigger refactor. */}

      <div className="text-xs text-gray-500 mt-3">
        Showing {data.length} records (API page {page}).
      </div>
    </div>
  );
};

export default ViewAllTransactions;

