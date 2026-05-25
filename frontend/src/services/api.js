import axios from 'axios';
import toast from 'react-hot-toast';

// API base URL - connects to backend
// Frontend calls endpoints like: GET /dashboard/all-transactions
// Backend mounts them under: /api/dashboard/...
// So baseURL must end with `/api`.
//
// Set in frontend/.env as:
//   VITE_API_URL=http://localhost:5000/api
// If you set it without `/api`, this code will append it.
const rawApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const normalizedApiUrl = rawApiUrl.replace(/\/+$/, '');
const API_BASE = normalizedApiUrl.endsWith('/api')
  ? normalizedApiUrl
  : normalizedApiUrl + '/api';


// Axios instance
const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds timeout
});

// Request interceptor - Add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle different error scenarios
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      const message = data?.message || 'Something went wrong!';

      switch (status) {
        case 401:
          // Unauthorized - redirect to login
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          if (window.location.pathname !== '/login') {
            toast.error('Session expired. Please login again.');
            window.location.href = '/login';
          }
          break;
        case 403:
          toast.error('You do not have permission to perform this action.');
          break;
        case 404:
          toast.error('Resource not found.');
          break;
        case 422:
          toast.error(message || 'Validation error.');
          break;
        case 500:
          toast.error('Server error. Please try again later.');
          break;
        default:
          toast.error(message);
      }
    } else if (error.request) {
      // Request made but no response
      toast.error('Network error. Please check your connection.');
    } else {
      // Something else happened
      toast.error('An unexpected error occurred.');
    }

    return Promise.reject(error);
  }
);

// Devotees API
export const devoteesAPI = {
  getAll: async () => {
    const response = await api.get('/devotees');
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/devotees/${id}`);
    return response.data;
  },
  create: async (devotee) => {
    const response = await api.post('/devotees', devotee);
    return response.data;
  },
  update: async (id, devotee) => {
    const response = await api.put(`/devotees/${id}`, devotee);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/devotees/${id}`);
    return response.data;
  }
};

// Sevas API
export const sevasAPI = {
  getAll: async () => {
    const response = await api.get('/sevas');
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/sevas/${id}`);
    return response.data;
  },
  getSlots: async (sevaId) => {
    const response = await api.get(`/sevas/${sevaId}/slots`);
    return response.data;
  },
  book: async (bookingData) => {
    const response = await api.post('/sevas/book', bookingData);
    return response.data;
  },
  create: async (seva) => {
    const response = await api.post('/sevas', seva);
    return response.data;
  },
  update: async (id, seva) => {
    const response = await api.put(`/sevas/${id}`, seva);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/sevas/${id}`);
    return response.data;
  },
  getBookings: async (params = {}) => {
    const response = await api.get('/sevas/bookings', { params });
    return response.data;
  }
};

// Donations API
export const donationsAPI = {
  getAll: async (params = {}) => {
    const response = await api.get('/donations', { params });
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/donations/${id}`);
    return response.data;
  },
  create: async (donation) => {
    const response = await api.post('/donations', donation);
    return response.data;
  },
  update: async (id, donation) => {
    const response = await api.put(`/donations/${id}`, donation);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/donations/${id}`);
    return response.data;
  }
};

// Rooms API (Corrected)
export const roomsAPI = {
  // Compatibility: frontend pages use older method names (getSetup/getBooking/etc.)
  // Keep both the newer names and the old ones as aliases.
  // Room Setup endpoints
  getAllRooms: async () => {
    const response = await api.get('/rooms/setup');
    return response.data;
  },
  getRoomById: async (id) => {
    // Backend has only /rooms/setup and /rooms/setup update; keep this for compatibility
    // Return from /rooms/setup list
    const rooms = await api.get('/rooms/setup');
    return (rooms.data || []).find(r => r.id === id || r.roomId === id);
  },
  createRoom: async (roomData) => {
    const response = await api.post('/rooms', roomData);
    return response.data;
  },
  updateRoom: async (id, roomData) => {
    const response = await api.put(`/rooms/${id}`, roomData);
    return response.data;
  },
  deleteRoom: async (id) => {
    const response = await api.delete(`/rooms/${id}`);
    return response.data;
  },
  
  // Room Booking endpoints
  getAllBookings: async (params = {}) => {
    const response = await api.get('/rooms/booking', { params });
    return response.data;
  },

  // Old frontend page aliases
  getSetup: async () => {
    const res = await api.get('/rooms/setup');
    // Normalize: backend stores `roomId`, frontend expects `id`
    return (res.data || []).map(room => ({
      ...room,
      id: room.id ?? room.roomId,
    }));
  },
  getBooking: async () => {
    const res = await api.get('/rooms/booking');
    return res.data;
  },
  createSetup: async (roomData) => {
    const res = await api.post('/rooms/setup', roomData);
    return res.data;
  },
  updateSetup: async (id, roomData) => {
    const res = await api.put(`/rooms/setup/${id}`, roomData);
    return res.data;
  },
  deleteSetup: async (id) => {
    const res = await api.delete(`/rooms/setup/${id}`);
    return res.data;
  },
  getBookingById: async (id) => {
    const response = await api.get(`/rooms/booking/${id}`);
    return response.data;
  },
  createBooking: async (bookingData) => {
    const response = await api.post('/rooms/booking', bookingData);
    return response.data;
  },
  updateBooking: async (id, bookingData) => {
    const response = await api.put(`/rooms/booking/${id}`, bookingData);
    return response.data;
  },
  updateBookingStatus: async (id, status) => {
    const response = await api.put(`/rooms/booking/${id}/status`, { status });
    return response.data;
  },
  cancelBooking: async (id) => {
    const response = await api.delete(`/rooms/booking/${id}`);
    return response.data;
  },
  deleteBooking: async (id) => {
    const response = await api.delete(`/rooms/booking/${id}`);
    return response.data;
  },
  
  // Check availability
  checkAvailability: async (roomId, checkIn, checkOut) => {
    const response = await api.get('/rooms/check-availability', {
      params: { roomId, checkIn, checkOut }
    });
    return response.data;
  },
  
  // Get available rooms for dates
  getAvailableRooms: async (checkIn, checkOut) => {
    const response = await api.get('/rooms/available', {
      params: { checkIn, checkOut }
    });
    return response.data;
  },
  
  // Booking statistics
  getBookingStats: async () => {
    const response = await api.get('/rooms/bookings/stats');
    return response.data;
  }
};

// Alerts API
export const alertsAPI = {
  getAll: async () => {
    const response = await api.get('/alerts');
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/alerts/${id}`);
    return response.data;
  },
  create: async (alertData) => {
    const response = await api.post('/alerts', alertData);
    return response.data;
  },
  update: async (id, alertData) => {
    const response = await api.put(`/alerts/${id}`, alertData);
    return response.data;
  },
  updateStatus: async (alertId, status) => {
    const response = await api.patch(`/alerts/${alertId}/status`, { status });
    return response.data;
  },
  dismiss: async (alertId) => {
    const response = await api.delete(`/alerts/${alertId}`);
    return response.data;
  }
};

// Dashboard API
export const dashboardAPI = {
  getStats: async () => {
    const response = await api.get('/dashboard/stats');
    return response.data;
  },
  getWeeklyRevenue: async () => {
    const response = await api.get('/dashboard/weekly-revenue');
    return response.data;
  },
  getSevaDistribution: async () => {
    const response = await api.get('/dashboard/seva-distribution');
    return response.data;
  },
  getDonationDistribution: async () => {
    const response = await api.get('/dashboard/donation-distribution');
    return response.data;
  },
  getRecentTransactions: async (limit = 10) => {
    const response = await api.get('/dashboard/recent-transactions', { params: { limit } });
    return response.data;
  },
  getAllTransactions: async ({ page = 1, limit = 10, search = '' } = {}) => {
    const response = await api.get('/dashboard/all-transactions', {
      params: { page, limit, search: search || undefined }
    });
    return response.data;
  },
  getDailyReport: async (date) => {
    const response = await api.get('/dashboard/daily-report', { params: { date } });
    return response.data;
  }
};

// Reports API
export const reportsAPI = {
  getDailyReport: async (date) => {
    // Backend implements this as: GET /api/dashboard/daily-report?date=YYYY-MM-DD
    const response = await api.get('/dashboard/daily-report', { params: { date } });
    return response.data;
  },
  getMonthlyReport: async (year, month) => {
    const response = await api.get('/reports/monthly', { params: { year, month } });
    return response.data;
  },
  getCustomReport: async (startDate, endDate) => {
    const response = await api.get('/reports/custom', { params: { startDate, endDate } });
    return response.data;
  },
  exportReport: async (format, params = {}) => {
    const response = await api.get('/reports/export', { 
      params: { format, ...params },
      responseType: 'blob'
    });
    return response.data;
  }
};

// Auth API
export const authAPI = {
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },
  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
  forgotPassword: async (email) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },
  resetPassword: async (token, password) => {
    const response = await api.post('/auth/reset-password', { token, password });
    return response.data;
  }
};

// Staff API
export const staffAPI = {
  getAll: async (params = {}) => {
    const response = await api.get('/staff', { params });
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/staff/${id}`);
    return response.data;
  },
  create: async (staff) => {
    const response = await api.post('/staff', staff);
    return response.data;
  },
  update: async (id, staff) => {
    const response = await api.put(`/staff/${id}`, staff);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/staff/${id}`);
    return response.data;
  },
  updateStatus: async (id, status) => {
    const response = await api.patch(`/staff/${id}/status`, { status });
    return response.data;
  }
};

// Festival API
export const festivalAPI = {
  getAll: async (params = {}) => {
    const response = await api.get('/festivals', { params });
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/festivals/${id}`);
    return response.data;
  },
  getUpcoming: async () => {
    const response = await api.get('/festivals/upcoming');
    return response.data;
  },
  create: async (festival) => {
    const response = await api.post('/festivals', festival);
    return response.data;
  },
  update: async (id, festival) => {
    const response = await api.put(`/festivals/${id}`, festival);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/festivals/${id}`);
    return response.data;
  }
};

// Counter API
export const counterAPI = {
  getAll: async () => {
    const response = await api.get('/counters');
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/counters/${id}`);
    return response.data;
  },
  create: async (counter) => {
    const response = await api.post('/counters', counter);
    return response.data;
  },
  update: async (id, counter) => {
    const response = await api.put(`/counters/${id}`, counter);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/counters/${id}`);
    return response.data;
  },
  getDailyCollection: async (date) => {
    const response = await api.get('/counters/daily-collection', { params: { date } });
    return response.data;
  }
};

// Prasada API
export const prasadaAPI = {
  getAll: async (params = {}) => {
    const response = await api.get('/prasada/items', { params });
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/prasada/items/${id}`);
    return response.data;
  },
  create: async (item) => {
    const response = await api.post('/prasada/items', item);
    return response.data;
  },
  update: async (id, item) => {
    const response = await api.put(`/prasada/items/${id}`, item);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/prasada/items/${id}`);
    return response.data;
  },
  createSale: async (saleData) => {
    const response = await api.post('/prasada/sales', saleData);
    return response.data;
  },
  getSales: async (params = {}) => {
    const response = await api.get('/prasada/sales', { params });
    return response.data;
  }
};

// Inventory API
export const inventoryAPI = {
  getAll: async (params = {}) => {
    const response = await api.get('/inventory/items', { params });
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/inventory/items/${id}`);
    return response.data;
  },
  create: async (item) => {
    const response = await api.post('/inventory/items', item);
    return response.data;
  },
  update: async (id, item) => {
    const response = await api.put(`/inventory/items/${id}`, item);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/inventory/items/${id}`);
    return response.data;
  },
  addStock: async (stockData) => {
    const response = await api.post('/inventory/stock', stockData);
    return response.data;
  },
  getLowStock: async () => {
    const response = await api.get('/inventory/low-stock');
    return response.data;
  },
  getStockAlerts: async () => {
    const response = await api.get('/inventory/alerts');
    return response.data;
  }
};

// Ledger API
export const ledgerAPI = {
  getAll: async (params = {}) => {
    const response = await api.get('/ledger', { params });
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/ledger/${id}`);
    return response.data;
  },
  create: async (entry) => {
    const response = await api.post('/ledger', entry);
    return response.data;
  },
  update: async (id, entry) => {
    const response = await api.put(`/ledger/${id}`, entry);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/ledger/${id}`);
    return response.data;
  },
  getBalance: async () => {
    const response = await api.get('/ledger/balance');
    return response.data;
  }
};

// Users API
export const usersAPI = {
  // Admin endpoints
  getAll: async (params = {}) => {
    const response = await api.get('/users', { params });
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },
  create: async (user) => {
    const response = await api.post('/users', user);
    return response.data;
  },
  update: async (id, user) => {
    const response = await api.put(`/users/${id}`, user);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },
  updateStatus: async (id, status) => {
    const response = await api.patch(`/users/${id}/status`, { status });
    return response.data;
  },
  assignRole: async (id, role) => {
    const response = await api.put(`/users/${id}/role`, { role });
    return response.data;
  },

  // Current user endpoints
  getProfile: async () => {
    const response = await api.get('/users/profile');
    return response.data;
  },
  updateProfile: async (userData) => {
    const response = await api.put('/users/profile', userData);
    return response.data;
  },
  changePassword: async (passwordData) => {
    const response = await api.post('/users/change-password', passwordData);
    return response.data;
  },
  getMyReports: async () => {
    const response = await api.get('/users/my-reports');
    return response.data;
  },
  getMyActivities: async () => {
    const response = await api.get('/users/my-activities');
    return response.data;
  }
};

// Roles API
export const rolesAPI = {
  getAll: async () => {
    const response = await api.get('/roles');
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/roles/${id}`);
    return response.data;
  },
  create: async (role) => {
    const response = await api.post('/roles', role);
    return response.data;
  },
  update: async (id, role) => {
    const response = await api.put(`/roles/${id}`, role);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/roles/${id}`);
    return response.data;
  }
};

// Expenses API
export const expensesAPI = {
  getAll: async (params = {}) => {
    const response = await api.get('/expenses', { params });
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/expenses/${id}`);
    return response.data;
  },
  create: async (expense) => {
    const response = await api.post('/expenses', expense);
    return response.data;
  },
  update: async (id, expense) => {
    const response = await api.put(`/expenses/${id}`, expense);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/expenses/${id}`);
    return response.data;
  },
  getByCategory: async (category) => {
    const response = await api.get('/expenses/category', { params: { category } });
    return response.data;
  },
  getTotal: async (params = {}) => {
    const response = await api.get('/expenses/total', { params });
    return response.data;
  }
};

// Audit Logs API
export const auditLogsAPI = {
  getAll: async (params = {}) => {
    const response = await api.get('/audit-logs', { params });
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/audit-logs/${id}`);
    return response.data;
  },
  getByUser: async (userId) => {
    const response = await api.get('/audit-logs/user', { params: { userId } });
    return response.data;
  },
  getByAction: async (action) => {
    const response = await api.get('/audit-logs/action', { params: { action } });
    return response.data;
  },
  getByDateRange: async (startDate, endDate) => {
    const response = await api.get('/audit-logs/date-range', { params: { startDate, endDate } });
    return response.data;
  },
  exportLogs: async (params = {}) => {
    const response = await api.get('/audit-logs/export', { 
      params,
      responseType: 'blob'
    });
    return response.data;
  }
};

// Receipt Configuration API
export const receiptConfigAPI = {
  getConfig: async () => {
    const response = await api.get('/receipt-config');
    return response.data;
  },
  updateConfig: async (config) => {
    const response = await api.put('/receipt-config', config);
    return response.data;
  },
  getPrintSettings: async () => {
    const response = await api.get('/receipt-config/print');
    return response.data;
  },
  updatePrintSettings: async (settings) => {
    const response = await api.put('/receipt-config/print', settings);
    return response.data;
  }
};

// Backup API
export const backupAPI = {
  createBackup: async (type = 'full') => {
    const response = await api.post('/backup', { type });
    return response.data;
  },
  getBackups: async () => {
    const response = await api.get('/backup');
    return response.data;
  },
  getStats: async () => {
    const response = await api.get('/backup/stats');
    return response.data;
  },
  restoreBackup: async (backupId) => {
    const response = await api.post(`/backup/restore/${backupId}`);
    return response.data;
  },
  deleteBackup: async (backupId) => {
    const response = await api.delete(`/backup/${backupId}`);
    return response.data;
  },
  downloadBackup: async (backupId) => {
    const response = await api.get(`/backup/download/${backupId}`, {
      responseType: 'blob'
    });
    return response.data;
  }
};

export default api;