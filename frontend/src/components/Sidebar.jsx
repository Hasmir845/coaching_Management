import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Menu, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { BrandTitle } from './BrandTitle';

const Sidebar = ({ isOpen, toggleSidebar, navigate }) => {
  const { user, signOut, isAdmin, isTeacher } = useAuth();
  const location = useLocation();
  const [activeMenu, setActiveMenu] = useState('dashboard');

  // Update active menu based on current route
  useEffect(() => {
    const currentPath = location.pathname;
    const menuItem = getMenuItems().find(item => item.route === currentPath);
    if (menuItem) {
      setActiveMenu(menuItem.id);
    }
  }, [location.pathname, isAdmin, isTeacher]);

  const handleLogout = async () => {
    const result = await signOut();
    if (result.success) {
      navigate('/login');
    }
  };

  const getMenuItems = () => {
    // Admin menu - can access everything
    if (isAdmin) {
      return [
        { id: 'dashboard', label: 'Dashboard', icon: '📊', route: '/' },
        { id: 'admin', label: 'Admin Panel', icon: '🔐', route: '/admin' },
        { id: 'teachers', label: 'Teachers', icon: '👨‍🏫', route: '/teachers' },
        { id: 'batches', label: 'Batches', icon: '📚', route: '/batches' },
        { id: 'students', label: 'Students', icon: '👨‍🎓', route: '/students' },
        { id: 'classes', label: 'Class Tracking', icon: '📋', route: '/class-tracking' },
        { id: 'reports', label: 'Reports', icon: '📈', route: '/reports' },
        { id: 'finance', label: 'Accounts', icon: '💰', route: '/finance' },
      ];
    }

    // Teacher menu - limited access
    if (isTeacher) {
      return [
        { id: 'classTracking', label: 'Class Tracking', icon: '📋', route: '/teacher-dashboard' },
        { id: 'dashboard', label: 'Dashboard', icon: '📊', route: '/' },
      ];
    }

    // Regular user menu
    return [
      { id: 'dashboard', label: 'Dashboard', icon: '📊', route: '/' },
    ];
  };

  const menuItems = getMenuItems();

  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-secondary text-white h-16 flex items-center px-3 z-50 gap-2">
        <button type="button" onClick={toggleSidebar} className="text-white p-1 shrink-0" aria-label="Open menu">
          <Menu size={24} />
        </button>
        <img src="/coaching-logo.svg" alt="Coaching logo" width={36} height={36} className="rounded-lg shrink-0" />
        <h1 className="font-bold text-lg truncate">Coaching Center</h1>
        <button
          type="button"
          onClick={handleLogout}
          className="ml-auto text-white p-1 shrink-0"
          aria-label="Logout"
        >
          <LogOut size={24} />
        </button>
      </div>

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 h-screen bg-secondary text-white w-64 z-40 flex flex-col min-h-0 transform transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 md:relative md:top-0 mt-16 md:mt-0`}
      >
        <div className="shrink-0 p-6 pb-4">
          <BrandTitle title="Coaching Hub" />

          {user && (
            <div className="mt-6 mb-0 pb-6 border-b border-gray-600">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full border-2 border-primary overflow-hidden flex-shrink-0">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt="Profile"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentElement.innerHTML = `<div class="w-full h-full bg-primary flex items-center justify-center text-white font-bold">${(user.displayName || user.email || 'U').charAt(0).toUpperCase()}</div>`;
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-primary flex items-center justify-center text-white font-bold">
                      {(user.displayName || user.email || 'U').charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-300">Logged in as</p>
                  <p className="text-white font-semibold truncate text-sm">
                    {user.displayName || user.email}
                  </p>
                  {isAdmin && <p className="text-xs text-blue-400">Admin</p>}
                  {isTeacher && <p className="text-xs text-green-400">Teacher</p>}
                </div>
              </div>
            </div>
          )}
        </div>

        <nav className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-6 pb-2 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveMenu(item.id);
                navigate(item.route);
                if (window.innerWidth < 768) toggleSidebar();
              }}
              className={`w-full text-left px-4 py-3 rounded-lg transition duration-200 flex items-center gap-3 ${
                activeMenu === item.id
                  ? 'bg-primary text-white'
                  : 'text-gray-300 hover:bg-gray-700'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="shrink-0 mt-auto p-6 pt-4 border-t border-gray-600 bg-secondary">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-4 py-3 text-red-400 hover:bg-gray-700 rounded-lg transition duration-200"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={toggleSidebar}
        />
      )}
    </>
  );
};

export default Sidebar;
