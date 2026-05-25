import React, { useState, useEffect, useCallback } from 'react';
import { FiRefreshCw, FiEye, FiEyeOff, FiTrash2, FiBell } from 'react-icons/fi';
import Layout from '../../components/Layout/Layout';
import DataTable from '../../components/Common/DataTable';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import AlertMessage from '../../components/Common/AlertMessage';
import { alertsAPI } from '../../services/api.js';

const AlertSystem = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAlerts = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await alertsAPI.getAll();
      setAlerts(response.data || response || []);
    } catch (err) {
      console.error('Fetch alerts error:', err);
      setError('Failed to fetch alerts');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAlerts();

    const interval = setInterval(fetchAlerts, 30000);
    return () => clearInterval(interval);
  }, [fetchAlerts]);

  const handleMarkRead = async (alertId) => {
    try {
      await alertsAPI.updateStatus(alertId, 'read');
      setAlerts(alerts.map(alert =>
        (alert._id || alert.id) === alertId ? { ...alert, status: 'read' } : alert
      ));
    } catch (err) {
      console.error('Mark read error:', err);
    }
  };

  const handleDismiss = async (alertId) => {
    try {
      await alertsAPI.dismiss(alertId);
      setAlerts(alerts.filter(alert => (alert._id || alert.id) !== alertId));
    } catch (err) {
      console.error('Dismiss error:', err);
    }
  };

  const typeBadge = (type) => {
    const badges = {
      success: 'bg-green-100 text-green-800',
      error: 'bg-red-100 text-red-800',
      warning: 'bg-yellow-100 text-yellow-800',
      info: 'bg-blue-100 text-blue-800',
      default: 'bg-gray-100 text-gray-800'
    };
    return `px-2 py-1 rounded-full text-xs font-medium ${badges[type] || badges.default}`;
  };

  const statusBadge = (status) => {
    const badges = {
      active: 'bg-orange-100 text-orange-800',
      unread: 'bg-blue-100 text-blue-800 ring-2 ring-blue-200',
      read: 'bg-gray-100 text-gray-600',
      dismissed: 'bg-gray-200 text-gray-400 line-through'
    };
    return `px-2 py-1 rounded-full text-xs font-medium ${badges[status] || badges.read}`;
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const columns = [
    { 
      key: 'title', 
      header: 'Title',
      render: (value) => (
        <span className="font-medium text-gray-900">{value || 'No Title'}</span>
      )
    },
    { 
      key: 'message', 
      header: 'Message',
      render: (value, row) => (
        <div className="max-w-md">
          <p className="text-sm text-gray-900 truncate" title={value}>{value}</p>
          <p className="text-xs text-gray-500 mt-1">{row.title}</p>
        </div>
      )
    },
    { 
      key: 'type', 
      header: 'Type',
      render: (value) => <span className={typeBadge(value)}>{value.toUpperCase()}</span>
    },
    { 
      key: 'timestamp', 
      header: 'Time',
      render: (value) => <span className="text-sm">{formatTimestamp(value)}</span>
    },
    { 
      key: 'status', 
      header: 'Status',
      render: (value) => <span className={statusBadge(value)}>{value.toUpperCase()}</span>
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (_, row) => (
        <div className="flex space-x-2">
          {row.status !== 'read' && (
            <button
              onClick={() => handleMarkRead(row._id || row.id)}
              className="p-1 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded"
              title="Mark as read"
            >
              <FiEye size={16} />
            </button>
          )}
          {row.status === 'read' && (
            <button
              onClick={() => handleMarkRead(row._id || row.id)}
              className="p-1 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded"
              title="Unread"
            >
              <FiEyeOff size={16} />
            </button>
          )}
          <button
            onClick={() => handleDismiss(row._id || row.id)}
            className="p-1 text-red-600 hover:text-red-900 hover:bg-red-50 rounded"
            title="Dismiss"
          >
            <FiTrash2 size={16} />
          </button>
        </div>
      )
    }
  ];

  const unreadCount = alerts.filter(a => a.status === 'unread').length;

  return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-3">
            <FiBell className="h-8 w-8 text-orange-500" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Alert System</h1>
              {unreadCount > 0 && (
                <div className="flex items-center space-x-1">
                  <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-sm font-medium">
                    {unreadCount} unread
                  </span>
                </div>
              )}
            </div>
          </div>
          <button
            onClick={fetchAlerts}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FiRefreshCw className="animate-spin h-4 w-4" />
            <span>Refresh</span>
          </button>
        </div>

        {error && <AlertMessage type="error" message={error} />}

        {loading ? (
          <LoadingSpinner />
        ) : (
            <DataTable
            data={alerts}
            columns={columns}
            itemsPerPage={2}
          />
        )}
      </div>
  );
};

export default AlertSystem;
