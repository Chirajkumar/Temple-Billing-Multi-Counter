import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiMenu, FiUser, FiLogOut, FiBell, FiChevronDown, FiMaximize2, FiMinimize2 } from 'react-icons/fi';
import { logout, getCurrentUser } from '../../services/auth';
import toast from 'react-hot-toast';
import ProfileModal from '../User/ProfileModal';
import ChangePasswordModal from '../User/ChangePasswordModal';
import { dashboardAPI } from '../../services/api';


const Header = ({ toggleMobileSidebar }) => {

  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const [showChangePassword, setShowChangePassword] = useState(false);

  const currentUser = getCurrentUser();

  const [notifications, setNotifications] = useState([]);


  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => {
        document.body.classList.add('fullscreen-mode');
        setIsFullscreen(true);
      });
    } else {
      document.exitFullscreen().then(() => {
        document.body.classList.remove('fullscreen-mode');
        setIsFullscreen(false);
      });
    }
  }, []);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
      if (!document.fullscreenElement) {
        document.body.classList.remove('fullscreen-mode');
      } else {
        document.body.classList.add('fullscreen-mode');
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Dashboard header notifications (unread alerts)
  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const stats = await dashboardAPI.getStats();
        const unreadAlerts = stats?.unreadAlerts ?? 0;

        // Keep local shape compatible with existing UI.
        // We only get count from backend stats, so message content is placeholder.
        const list = unreadAlerts > 0
          ? [
              {
                id: 'unread',
                title: 'Unread Alerts',
                message: `${unreadAlerts} unread alert(s)`,
                time: 'Just now',
                read: false,
              }
            ]
          : [];

        setNotifications(list);
      } catch (e) {
        // Non-blocking
        setNotifications([]);
      }
    };

    loadNotifications();
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);


  return (
    <>
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="flex items-center justify-between px-4 md:px-6 py-3">
          <button
            onClick={toggleMobileSidebar}
            className="md:hidden text-gray-600 hover:text-gray-900 focus:outline-none p-2 rounded-lg hover:bg-gray-100"
            aria-label="Toggle mobile menu"
          >
            <FiMenu className="h-6 w-6" />
          </button>
          
          <div className="hidden md:block"></div>

          <div className="flex items-center space-x-2 md:space-x-4">
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative text-gray-600 hover:text-gray-900 p-2 rounded-lg hover:bg-gray-100"
                aria-label="Notifications"
              >
                <FiBell className="h-5 w-5" />
                <span className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  2
                </span>
              </button>
              
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white rounded-lg shadow-lg z-20 max-h-[80vh] overflow-hidden">
                  <div className="p-3 border-b">
                    <h3 className="font-semibold">Notifications</h3>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.map(notif => (
                      <div key={notif.id} className={`p-3 border-b hover:bg-gray-50 cursor-pointer ${!notif.read ? 'bg-blue-50' : ''}`}>
                        <p className="font-medium text-sm">{notif.title}</p>
                        <p className="text-xs text-gray-600 mt-1">{notif.message}</p>
                        <p className="text-xs text-gray-400 mt-1">{notif.time}</p>
                      </div>
                    ))}
                  </div>
                  <div className="p-2 text-center border-t">
                    <button
                      onClick={() => {
                        setShowNotifications(false);
                        navigate('/alerts');
                      }}
                      className="text-sm text-orange-600 hover:text-orange-700"
                    >
                      View All
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={toggleFullscreen}
              className="hidden sm:block text-gray-600 hover:text-gray-900 p-2 rounded-lg hover:bg-gray-100"
              title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
              aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            >
              {isFullscreen ? <FiMinimize2 className="h-5 w-5" /> : <FiMaximize2 className="h-5 w-5" />}
            </button>

            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 p-2 rounded-lg hover:bg-gray-100"
                aria-label="User menu"
              >
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white">
                  <FiUser className="h-4 w-4" />
                </div>
                <span className="hidden sm:block text-sm font-medium">{currentUser?.name || 'User'}</span>
                <FiChevronDown className="h-4 w-4" />
              </button>

              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-20 py-1">
                  <ProfileModal isOpen={showProfile} onClose={() => setShowProfile(false)} />

                  <ChangePasswordModal isOpen={showChangePassword} onClose={() => setShowChangePassword(false)} />

                  <button 
                    onClick={() => setShowProfile(true)}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Profile Settings
                  </button>

                    <button 
                      onClick={() => setShowChangePassword(true)}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Change Password
                    </button>

                  <hr className="my-1 border-gray-200" />
                  <button 
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                  >
                    <FiLogOut className="inline mr-2 h-4 w-4" /> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;

