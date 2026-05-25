import React, { useEffect, useState } from 'react';
import { FiDownload, FiTrash2, FiRefreshCw } from 'react-icons/fi';
import AlertMessage from '../../components/Common/AlertMessage';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import { backupAPI } from '../../services/api';
import toast from 'react-hot-toast';

const BackupRestore = () => {
  const [backupLoading, setBackupLoading] = useState(false);
  const [restoreLoading, setRestoreLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [backups, setBackups] = useState([]);
  const [stats, setStats] = useState(null);
  const [selectedBackupId, setSelectedBackupId] = useState('');

  const loadBackups = async () => {
    try {
      setLoading(true);
      const data = await backupAPI.getBackups();
      setBackups(data.backups || []);
      setStats(data.stats || null);
      if (!selectedBackupId && data.backups?.length) {
        setSelectedBackupId(data.backups[0].id);
      }
    } catch (error) {
      console.error('Failed to load backups:', error);
      toast.error('Failed to load backups');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBackups();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleBackup = async () => {
    setBackupLoading(true);
    setMessage('');
    try {
      await backupAPI.createBackup('full');
      toast.success('Backup created successfully');
      await loadBackups();
    } catch (e) {
      const errorMsg = e?.response?.data?.message || e.message || 'Backup failed';
      setMessage(errorMsg);
      toast.error(errorMsg);
    } finally {
      setBackupLoading(false);
    }
  };

  const handleRestore = async () => {
    if (!selectedBackupId) {
      toast.error('Please select a backup');
      return;
    }
    
    if (!window.confirm('Are you sure? This will replace all current data with the backup.')) {
      return;
    }

    setRestoreLoading(true);
    setMessage('');
    try {
      await backupAPI.restoreBackup(selectedBackupId);
      toast.success('Restore completed successfully');
      await loadBackups();
    } catch (e) {
      const errorMsg = e?.response?.data?.message || e.message || 'Restore failed';
      setMessage(errorMsg);
      toast.error(errorMsg);
    } finally {
      setRestoreLoading(false);
    }
  };

  const handleDownload = async (backupId) => {
    try {
      const blob = await backupAPI.downloadBackup(backupId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `backup-${backupId}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Backup downloaded');
    } catch (e) {
      toast.error('Failed to download backup');
    }
  };

  const handleDelete = async (backupId) => {
    if (!window.confirm('Delete this backup permanently?')) return;

    setDeleteLoading(true);
    try {
      await backupAPI.deleteBackup(backupId);
      toast.success('Backup deleted');
      await loadBackups();
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Failed to delete backup');
    } finally {
      setDeleteLoading(false);
    }
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Backup & Restore</h1>
        <p className="text-gray-600 mt-1">Manage database backups and restore from snapshots</p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow border-l-4 border-blue-500">
            <div className="text-sm text-gray-600">Total Backups</div>
            <div className="text-2xl font-bold text-blue-600">{stats.totalBackups}</div>
            <div className="text-xs text-gray-500 mt-1">Max: {stats.maxBackups}</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border-l-4 border-green-500">
            <div className="text-sm text-gray-600">Total Size</div>
            <div className="text-2xl font-bold text-green-600">{stats.totalSizeMB} MB</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border-l-4 border-orange-500">
            <div className="text-sm text-gray-600">Latest Backup</div>
            <div className="text-sm font-semibold text-gray-800 truncate">
              {stats.newestBackup ? formatDate(stats.newestBackup.createdAt) : 'None'}
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border-l-4 border-purple-500">
            <div className="text-sm text-gray-600">Oldest Backup</div>
            <div className="text-sm font-semibold text-gray-800 truncate">
              {stats.oldestBackup ? formatDate(stats.oldestBackup.createdAt) : 'None'}
            </div>
          </div>
        </div>
      )}

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mb-6">
        <div className="bg-white p-6 rounded-lg shadow-md border">
          <h2 className="text-xl font-semibold mb-4 text-black">Create Backup</h2>
          <button
            onClick={handleBackup}
            disabled={backupLoading}
            className="w-full bg-green-600 text-black py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium"
          >
            {backupLoading ? 'Creating...' : '+ Create Backup'}
          </button>
          <p className="text-sm text-gray-600 mt-4">
            Creates a JSON snapshot of all database collections and stores it locally on the server.
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border">
          <h2 className="text-xl font-semibold mb-4 text-black">Restore Backup</h2>
          <select
            value={selectedBackupId}
            onChange={(e) => setSelectedBackupId(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={!backups?.length || restoreLoading}
          >
            {backups?.length ? (
              backups.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.id} ({formatBytes(b.size)})
                </option>
              ))
            ) : (
              <option value="">No backups available</option>
            )}
          </select>

          <button
            onClick={handleRestore}
            disabled={restoreLoading || !selectedBackupId}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium"
          >
            {restoreLoading ? 'Restoring...' : 'Restore Backup'}
          </button>
          <p className="text-sm text-gray-600 mt-4">
            ⚠️ Restores by clearing all collections and inserting data from the selected backup.
          </p>
        </div>
      </div>

      {message && (
        <AlertMessage
          type={message.toLowerCase().includes('failed') ? 'error' : 'success'}
          message={message}
          onClose={() => setMessage('')}
        />
      )}

      {/* Backups Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-900">Available Backups</h2>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : backups?.length ? (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-6 py-3 font-medium text-gray-700">Backup ID</th>
                  <th className="text-left px-6 py-3 font-medium text-gray-700">Created</th>
                  <th className="text-left px-6 py-3 font-medium text-gray-700">Size</th>
                  <th className="text-center px-6 py-3 font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {backups.map((b) => (
                  <tr key={b.id} className={b.id === selectedBackupId ? 'bg-blue-50' : 'hover:bg-gray-50'}>
                    <td className="px-6 py-3 font-mono text-sm text-gray-900">{b.id}</td>
                    <td className="px-6 py-3 text-gray-600">{formatDate(b.createdAt)}</td>
                    <td className="px-6 py-3 text-gray-600">{formatBytes(b.size)}</td>
                    <td className="px-6 py-3 text-center">
                      <div className="flex justify-center space-x-2">
                        <button
                          onClick={() => handleDownload(b.id)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded transition"
                          title="Download backup"
                        >
                          <FiDownload className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(b.id)}
                          disabled={deleteLoading}
                          className="p-2 text-red-600 hover:bg-red-50 rounded transition disabled:opacity-50"
                          title="Delete backup"
                        >
                          <FiTrash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6 text-center text-gray-600">
            <FiRefreshCw className="h-12 w-12 mx-auto text-gray-400 mb-2" />
            <p>No backups found yet. Create one to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BackupRestore;

