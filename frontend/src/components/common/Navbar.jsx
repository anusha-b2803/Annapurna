import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

const navLinks = [
  { path: '/dashboard', label: 'Dashboard', roles: ['donor', 'volunteer', 'orphanage'] },
  { path: '/donations', label: 'Donations', roles: ['donor', 'volunteer', 'orphanage'] },
  { path: '/requests', label: 'Requests', roles: ['orphanage', 'volunteer', 'donor'] },
  { path: '/map', label: 'Map', roles: ['donor', 'volunteer', 'orphanage'] },
  { path: '/community', label: 'Community', roles: ['donor', 'volunteer', 'orphanage'] },
  { path: '/admin', label: 'Admin Panel', roles: ['admin'] },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const roleColor = {
    donor: 'bg-emerald-100 text-emerald-700',
    volunteer: 'bg-green-100 text-green-700',
    orphanage: 'bg-teal-100 text-teal-700',
    admin: 'bg-slate-100 text-slate-700',
  };

  const filteredLinks = navLinks.filter(l => l.roles.includes(user?.role));

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-200 group-hover:scale-105 transition-transform">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
            </div>
            <span className="font-black text-2xl tracking-tight text-gray-900">Annapurna</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-2">
            {filteredLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                  location.pathname === link.path
                    ? 'bg-primary-50 text-primary-600 shadow-sm'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* User Menu */}
          <div className="relative hidden md:block">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-3 hover:bg-gray-50 rounded-2xl p-1.5 transition-all border border-transparent hover:border-gray-100"
            >
              <div className="w-9 h-9 rounded-xl bg-primary-50 flex items-center justify-center overflow-hidden border border-primary-100">
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-primary-700 font-black text-xs">{user?.name?.[0]?.toUpperCase()}</span>
                )}
              </div>
              <div className="text-left hidden lg:block">
                <p className="text-sm font-black text-gray-900 leading-none">{user?.name}</p>
                <span className={`text-[10px] font-black uppercase tracking-widest mt-1 inline-block px-2 py-0.5 rounded-full ${roleColor[user?.role]}`}>{user?.role}</span>
              </div>
              <svg className={`w-4 h-4 text-gray-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            <AnimatePresence>
              {dropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-3 w-56 bg-white rounded-[1.5rem] shadow-2xl border border-gray-100 py-3 z-50 overflow-hidden"
                >
                  <div className="px-4 py-2 mb-2 border-b border-gray-50">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Network Access</p>
                  </div>
                  <Link to={`/profile/${user?._id}`} className="flex items-center gap-3 px-4 py-2 text-sm font-bold text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-colors" onClick={() => setDropdownOpen(false)}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM4.5 18a8.5 8.5 0 0115 0z"/></svg>
                    My Profile
                  </Link>
                  <Link to="/settings" className="flex items-center gap-3 px-4 py-2 text-sm font-bold text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-colors" onClick={() => setDropdownOpen(false)}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                    Settings
                  </Link>
                  <hr className="my-2 border-gray-50" />
                  <button onClick={handleLogout} className="flex items-center gap-3 w-full text-left px-4 py-2 text-sm font-bold text-red-500 hover:bg-red-50 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
                    Sign Out
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Mobile menu button */}
          <button className="md:hidden p-2 bg-gray-50 rounded-xl" onClick={() => setMenuOpen(!menuOpen)}>
            <svg className="w-6 h-6 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d={menuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-gray-100 bg-white overflow-hidden shadow-2xl"
          >
            <div className="px-6 py-6 space-y-2">
              {filteredLinks.map(link => (
                <Link key={link.path} to={link.path} className="block px-4 py-3 rounded-2xl text-sm font-bold text-gray-700 hover:bg-primary-50 hover:text-primary-600" onClick={() => setMenuOpen(false)}>
                  {link.label}
                </Link>
              ))}
              <Link to={`/profile/${user?._id}`} className="block px-4 py-3 rounded-2xl text-sm font-bold text-gray-700 hover:bg-primary-50 hover:text-primary-600" onClick={() => setMenuOpen(false)}>My Profile</Link>
              <button onClick={handleLogout} className="block w-full text-left px-4 py-3 rounded-2xl text-sm font-bold text-red-500 hover:bg-red-50">Sign Out</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
