import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout = () => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Mobile sidebar overlay */}
      {mobileSidebarOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="fixed z-50 inset-y-0 left-0 w-64 sm:w-72 h-full overflow-y-auto bg-gradient-to-b from-orange-800 to-orange-900 transform transition-transform">
            <Sidebar 
              isOpen={true} 
              setIsOpen={setMobileSidebarOpen} 
              mobile={true}
            />
          </div>
        </>
      )}
      
      {/* Desktop sidebar - always visible on md and up */}
      <div className="hidden md:block md:w-64 lg:w-72 h-full overflow-y-auto bg-gradient-to-b from-orange-800 to-orange-900">
        <Sidebar 
          isOpen={true} 
          setIsOpen={() => {}} 
          mobile={false}
        />
      </div>
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          toggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
        />
        <main className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;