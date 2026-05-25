import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout/Layout';
import DataTable from '../../components/Common/DataTable';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import toast from 'react-hot-toast';
import { auditLogsAPI } from '../../services/api';

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState('');
  const [filterUser, setFilterUser] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [uniqueActions, setUniqueActions] = useState([]);
  const [uniqueUsers, setUniqueUsers] = useState([]);

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  useEffect(() => {
    filterLogs();
  }, [searchTerm, filterAction, filterUser, dateRange, logs]);

  const fetchAuditLogs = async () => {
    try {
      const data = await auditLogsAPI.getAll();

      const normalized = (data || []).map((log) => ({
        id: log._id || log.id,
        logId: log.logId,
        user: log.user?.name || log.user?.email || log.user?.id || '',
        action: log.action,
        module: log.module,
        timestamp: log.timestamp,
        formattedTime: log.timestamp ? new Date(log.timestamp).toLocaleString() : '',
        ip: log.ipAddress,
        details: log.details,
        status: 'Success'
      }));

      setLogs(normalized);
      setFilteredLogs(normalized);

      const actions = [...new Set(normalized.map((log) => log.action).filter(Boolean))];
      const users = [...new Set(normalized.map((log) => log.user).filter(Boolean))];
      setUniqueActions(actions);
      setUniqueUsers(users);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      toast.error('Failed to fetch audit logs');
      setLogs([]);
      setFilteredLogs([]);
    } finally {
      setLoading(false);
    }
  };

  // generateMockLogs removed - UI now uses DB audit logs
  const generateMockLogs = () => {
    const actions = ['Login', 'Logout', 'Add Devotee', 'Update Devotee', 'Delete Devotee', 
                     'Add Seva', 'Update Seva', 'Book Seva', 'Cancel Seva', 'Add Donation',
                     'Process Payment', 'Generate Receipt', 'Add Room', 'Book Room', 
                     'Check In', 'Check Out', 'Add Staff', 'Update Staff', 'Delete Staff',
                     'Add Festival', 'Update Festival', 'Add Expense', 'Update Settings',
                     'Export Report', 'View Report', 'Backup Data', 'Restore Data'];
    
    const users = ['admin@temple.com', 'staff.rajesh', 'staff.suresh', 'accountant.lakshmi', 
                   'manager.venkatesh', 'counter.ramesh', 'seva.kumar'];
    
    const ips = ['192.168.1.1', '192.168.1.2', '192.168.1.3', '192.168.1.4', '10.0.0.1', '172.16.0.1'];
    
    const logs = [];
    
    for (let i = 0; i < 50; i++) {
      const date = new Date();
      date.setDate(date.getDate() - Math.floor(Math.random() * 30));
      date.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60));
      
      const action = actions[Math.floor(Math.random() * actions.length)];
      const user = users[Math.floor(Math.random() * users.length)];
      const ip = ips[Math.floor(Math.random() * ips.length)];
      
      let details = '';
      switch(action) {
        case 'Login':
          details = `Successful login from ${ip}`;
          break;
        case 'Add Devotee':
          details = `Added devotee: ${['Ramesh Sharma', 'Sita Patel', 'Krishna Rao', 'Lakshmi Devi'][Math.floor(Math.random() * 4)]}`;
          break;
        case 'Book Seva':
          details = `Booked ${['Abhishekam', 'Archana', 'Kalyanam'][Math.floor(Math.random() * 3)]} seva`;
          break;
        case 'Process Payment':
          details = `Processed payment of ₹${Math.floor(Math.random() * 5000) + 100}`;
          break;
        default:
          details = `${action} performed successfully`;
      }
      
      logs.push({
        id: i + 1,
        logId: `LOG${String(i + 1).padStart(5, '0')}`,
        user: user,
        action: action,
        module: getModuleForAction(action),
        timestamp: date.toISOString(),
        formattedTime: date.toLocaleString(),
        ip: ip,
        details: details,
        status: Math.random() > 0.05 ? 'Success' : 'Failed',
        affectedRecord: action.includes('Add') || action.includes('Update') ? `ID: ${Math.floor(Math.random() * 1000)}` : '-'
      });
    }
    
    // Sort by timestamp descending (newest first)
    return logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  };

  const getModuleForAction = (action) => {
    if (action.includes('Devotee')) return 'Devotee Management';
    if (action.includes('Seva')) return 'Seva Management';
    if (action.includes('Donation')) return 'Donation';
    if (action.includes('Room') || action.includes('Check')) return 'Accommodation';
    if (action.includes('Staff')) return 'Staff Management';
    if (action.includes('Festival')) return 'Festival Management';
    if (action.includes('Payment') || action.includes('Receipt')) return 'Billing';
    if (action.includes('Report') || action.includes('Export')) return 'Reports';
    if (action.includes('Backup') || action.includes('Restore')) return 'System';
    return 'General';
  };

  // localStorage helpers removed - UI now uses DB audit logs


  const filterLogs = () => {
    let filtered = [...logs];
    
    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(log => 
        log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.module.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Action filter
    if (filterAction) {
      filtered = filtered.filter(log => log.action === filterAction);
    }
    
    // User filter
    if (filterUser) {
      filtered = filtered.filter(log => log.user === filterUser);
    }
    
    // Date range filter
    if (dateRange.start) {
      filtered = filtered.filter(log => new Date(log.timestamp) >= new Date(dateRange.start));
    }
    if (dateRange.end) {
      const endDate = new Date(dateRange.end);
      endDate.setHours(23, 59, 59);
      filtered = filtered.filter(log => new Date(log.timestamp) <= endDate);
    }
    
    setFilteredLogs(filtered);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterAction('');
    setFilterUser('');
    setDateRange({ start: '', end: '' });
  };

  const getActionBadge = (action) => {
    if (action.includes('Login') || action.includes('Logout')) return 'bg-blue-100 text-blue-800';
    if (action.includes('Add') || action.includes('Create')) return 'bg-green-100 text-green-800';
    if (action.includes('Update') || action.includes('Edit')) return 'bg-yellow-100 text-yellow-800';
    if (action.includes('Delete') || action.includes('Cancel')) return 'bg-red-100 text-red-800';
    if (action.includes('Book') || action.includes('Process')) return 'bg-purple-100 text-purple-800';
    if (action.includes('Export') || action.includes('Report')) return 'bg-indigo-100 text-indigo-800';
    return 'bg-gray-100 text-gray-800';
  };

  const getStatusBadge = (status) => {
    return status === 'Success' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800';
  };

  // Custom table rendering
  const renderTable = () => {
    if (filteredLogs.length === 0) {
      return (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No audit logs found</h3>
          <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filter criteria.</p>
          {(searchTerm || filterAction || filterUser || dateRange.start || dateRange.end) && (
            <div className="mt-6">
              <button
                onClick={clearFilters}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Log ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Module</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IP Address</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredLogs.map((log) => (
              <tr key={log.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-600">{log.logId || log.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{log.user}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getActionBadge(log.action)}`}>
                    {log.action}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.module}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.formattedTime || new Date(log.timestamp).toLocaleString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500">{log.ip}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(log.status)}`}>
                    {log.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 max-w-md truncate" title={log.details}>
                  {log.details}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };



  const stats = {
    total: filteredLogs.length,
    success: filteredLogs.filter(l => l.status === 'Success').length,
    failed: filteredLogs.filter(l => l.status === 'Failed').length,
    uniqueActions: uniqueActions.length,
    uniqueUsers: uniqueUsers.length
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Audit Logs</h1>
        <p className="text-sm text-gray-500 mt-1">Track all system activities, user actions, and security events</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg p-4 shadow border-l-4 border-blue-500">
          <div className="text-sm text-gray-500">Total Logs</div>
          <div className="text-2xl font-bold">{stats.total}</div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow border-l-4 border-green-500">
          <div className="text-sm text-gray-500">Successful</div>
          <div className="text-2xl font-bold text-green-600">{stats.success}</div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow border-l-4 border-red-500">
          <div className="text-sm text-gray-500">Failed</div>
          <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow border-l-4 border-purple-500">
          <div className="text-sm text-gray-500">Unique Actions</div>
          <div className="text-2xl font-bold text-purple-600">{stats.uniqueActions}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow mb-6 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              type="text"
              placeholder="Search by user, action, details..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Action Type</label>
            <select
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Actions</option>
              {uniqueActions.map(action => (
                <option key={action} value={action}>{action}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">User</label>
            <select
              value={filterUser}
              onChange={(e) => setFilterUser(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Users</option>
              {uniqueUsers.map(user => (
                <option key={user} value={user}>{user}</option>
              ))}
            </select>
          </div>
          
          <div className="flex items-end">
            <button
              onClick={clearFilters}
              className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition duration-200"
            >
              Clear Filters
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Logs Table */}
      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          {renderTable()}
          {filteredLogs.length > 0 && (
            <div className="px-6 py-3 bg-gray-50 border-t flex justify-between items-center text-sm text-gray-500">
              <span>Showing {filteredLogs.length} of {logs.length} logs</span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify(filteredLogs, null, 2));
                  toast.success('Logs copied to clipboard');
                }}
                className="text-blue-600 hover:text-blue-800"
              >
                Export to Clipboard
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AuditLogs;