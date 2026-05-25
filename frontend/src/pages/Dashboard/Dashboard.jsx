import React, { useState, useEffect } from 'react';
import { 
  FiUsers, FiDollarSign, FiHeart, FiShoppingCart, 
  FiAlertCircle, FiTrendingUp, FiCalendar, FiClock 
} from 'react-icons/fi';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { dashboardAPI } from '../../services/api';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const [stats, setStats] = useState({
    todayCollection: 0,
    totalSevaBookings: 0,
    totalDonations: 0,
    stockAlerts: 0,
    monthlyTarget: 500000,
    monthlyAchieved: 0,
    loading: true
  });

  const [revenueData, setRevenueData] = useState([
    { name: 'Mon', revenue: 0, expenses: 0 },
    { name: 'Tue', revenue: 0, expenses: 0 },
    { name: 'Wed', revenue: 0, expenses: 0 },
    { name: 'Thu', revenue: 0, expenses: 0 },
    { name: 'Fri', revenue: 0, expenses: 0 },
    { name: 'Sat', revenue: 0, expenses: 0 },
    { name: 'Sun', revenue: 0, expenses: 0 }
  ]);
  
  const [sevaData, setSevaData] = useState([
    { name: 'Abhishekam', bookings: 0, revenue: 0 },
    { name: 'Archana', bookings: 0, revenue: 0 },
    { name: 'Homam', bookings: 0, revenue: 0 }
  ]);
  
  const [donationData, setDonationData] = useState([
    { name: 'General', value: 0, color: '#FF6B6B' },
    { name: 'Annadanam', value: 0, color: '#4ECDC4' },
    { name: 'Construction', value: 0, color: '#45B7D1' },
    { name: 'Special', value: 0, color: '#96CEB4' }
  ]);
  
  const [recentTransactions, setRecentTransactions] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setStats(prev => ({ ...prev, loading: true }));
      
      // Fetch stats data
      let statsData = {
        todayCollection: 0,
        totalSevaBookings: 0,
        totalDonations: 0,
        stockAlerts: 0,
        monthlyTarget: 500000,
        monthlyAchieved: 0
      };
      
      try {
        const response = await dashboardAPI.getStats();
        statsData = { ...statsData, ...response };
      } catch (err) {
        console.error('Stats error:', err);
      }

      // Fetch weekly revenue
      let weeklyRevenue = revenueData;
      try {
        const response = await dashboardAPI.getWeeklyRevenue();
        if (response && response.length > 0) {
          weeklyRevenue = response;
        }
      } catch (err) {
        console.error('Weekly revenue error:', err);
      }

      // Fetch seva distribution
      let sevaDist = sevaData;
      try {
        const response = await dashboardAPI.getSevaDistribution();
        if (response && response.length > 0) {
          sevaDist = response;
        }
      } catch (err) {
        console.error('Seva distribution error:', err);
      }

      // Fetch donation distribution
      let donationDist = donationData;
      try {
        const response = await dashboardAPI.getDonationDistribution();
        if (response && response.length > 0) {
          donationDist = response;
        }
      } catch (err) {
        console.error('Donation distribution error:', err);
      }

      // Fetch recent transactions
      let transactions = [];
      try {
        const response = await dashboardAPI.getRecentTransactions();
        transactions = response || [];
      } catch (err) {
        console.error('Recent transactions error:', err);
      }

      setStats({ ...statsData, loading: false });
      setRevenueData(weeklyRevenue);
      setSevaData(sevaDist);
      setDonationData(donationDist);
      setRecentTransactions(transactions);
      
    } catch (error) {
      console.error('Dashboard error:', error);
      toast.error('Failed to load dashboard data');
      setStats(prev => ({ ...prev, loading: false }));
    }
  };

  const StatCard = ({ title, value, icon: Icon, color, trend, subtitle }) => {

    const colorClasses = {
      green: { bg: 'bg-green-100', text: 'text-green-600' },
      red: { bg: 'bg-red-100', text: 'text-red-600' },
      blue: { bg: 'bg-blue-100', text: 'text-blue-600' },
      yellow: { bg: 'bg-yellow-100', text: 'text-yellow-600' },
      orange: { bg: 'bg-orange-100', text: 'text-orange-600' },
      purple: { bg: 'bg-purple-100', text: 'text-purple-600' }
    };
    
    const colors = colorClasses[color] || colorClasses.blue;
    
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm font-medium">{title}</p>
            <p className="text-2xl font-bold mt-2">
              {typeof value === 'number' ? `${value.toLocaleString()}` : value}
            </p>
            {trend && (
              <p className="text-green-600 text-sm mt-2 flex items-center">
             
              </p>
            )}
            {subtitle && <p className="text-gray-400 text-xs mt-1">{subtitle}</p>}
          </div>
          <div className={`h-12 w-12 rounded-full ${colors.bg} flex items-center justify-center`}>
            <Icon className={`h-6 w-6 ${colors.text}`} />
          </div>
        </div>
      </div>
    );
  };

  const monthlyProgress = stats.monthlyTarget > 0 
    ? (stats.monthlyAchieved / stats.monthlyTarget) * 100 
    : 0;

  if (stats.loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Welcome to Temple Management System</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
        <StatCard 
          title="Today's Collection" 
          value={stats.todayCollection || 0} 
          icon={FiDollarSign} 
          color="green"
          trend={true}
        />
        <StatCard 
          title="Total Seva Bookings" 
          value={stats.totalSevaBookings || 0} 
          icon={FiHeart} 
          color="red"
   
        />
        <StatCard 
          title="Total Donations (Month)" 
          value={stats.totalDonations || 0} 
          icon={FiUsers} 
          color="blue"
        />
        <StatCard 
          title="Stock Alerts" 
          value={stats.stockAlerts || 0} 
          icon={FiAlertCircle} 
          color="yellow"
        />
      </div>

  

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
      
      </div>
    </div>
  );
};

export default Dashboard;