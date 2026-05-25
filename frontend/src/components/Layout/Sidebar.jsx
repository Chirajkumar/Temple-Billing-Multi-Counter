import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  FiHome, FiUsers, FiGrid, FiUserPlus, FiHeart, FiShoppingCart, FiDollarSign,
  FiHome as FiRoom, FiPackage, FiFileText, FiBook, FiBarChart2, FiBell, 
  FiActivity, FiPrinter, FiCalendar, FiShield, FiDatabase, FiSettings
} from 'react-icons/fi';

const Sidebar = ({ isOpen, setIsOpen, mobile = false }) => {
  const menuItems = [
    { path: '/dashboard', name: 'Dashboard', icon: FiHome },
    { path: '/users/add', name: 'User Management', icon: FiUsers },
    { path: '/users/roles', name: 'Role Permissions', icon: FiSettings },
    { path: '/counters/setup', name: 'Counter Setup', icon: FiGrid },
    { path: '/devotees/add', name: 'Devotee Management', icon: FiUserPlus },
    { path: '/seva/add', name: 'Seva Management', icon: FiHeart },
    { path: '/donations/add', name: 'Donations', icon: FiDollarSign },
    { path: '/prasada/items', name: 'Prasada Sales', icon: FiShoppingCart },
    { path: '/accommodation/rooms', name: 'Room Setup', icon: FiRoom },
    { path: '/accommodation/book', name: 'Room Booking', icon: FiCalendar },
    { path: '/inventory/items', name: 'Inventory', icon: FiPackage },
    { path: '/billing/receipt', name: 'Billing System', icon: FiFileText },
    { path: '/accounts/ledger', name: 'Accounts', icon: FiBook },
    { path: '/reports/daily', name: 'Reports', icon: FiBarChart2 },
    { path: '/alerts', name: 'Alerts', icon: FiBell },
    { path: '/audit-logs', name: 'Audit Logs', icon: FiActivity },
    { path: '/expenses', name: 'Expenses', icon: FiDollarSign },
    { path: '/receipt-config', name: 'Receipt Config', icon: FiPrinter },
    { path: '/festivals', name: 'Festivals', icon: FiCalendar },
    { path: '/staff', name: 'Staff Management', icon: FiUsers },
    { path: '/security/backup', name: 'Security & Backup', icon: FiShield }
  ];

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 sm:p-6 border-b border-orange-700">
        <h1 className="font-bold text-xl sm:text-2xl text-white">
          Temple Management
        </h1>
        {mobile && (
          <button 
            onClick={() => setIsOpen(false)}
            className="mt-4 text-white hover:text-orange-200 p-2 rounded-lg hover:bg-orange-700 text-sm"
          >
            ✕ Close
          </button>
        )}
      </div>
      <nav className="flex-1 overflow-y-auto mt-2 p-2">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={mobile ? () => setIsOpen(false) : undefined}
            className={({ isActive }) =>
              `flex items-center w-full px-4 sm:px-6 py-3 sm:py-4 my-1 rounded-xl hover:bg-orange-700/80 transition-all duration-200 text-white ${
                isActive ? 'bg-orange-600 border-2 border-yellow-400 shadow-md' : ''
              }`
            }
          >
            <item.icon className="h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0" />
            <span className="ml-3 sm:ml-4 font-medium text-base sm:text-lg">{item.name}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
