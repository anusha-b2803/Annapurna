import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import Navbar from '../components/common/Navbar';
import DonationCard from '../components/common/DonationCard';
import Spinner from '../components/common/Spinner';
import api from '../utils/api';
import { toast } from 'react-toastify';

const roleGreeting = {
  donor: { 
    icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>, 
    action: 'Post a Donation', 
    link: '/donations/new', 
    color: 'from-emerald-500 to-teal-600' 
  },
  volunteer: { 
    icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>, 
    action: 'Find Deliveries', 
    link: '/donations', 
    color: 'from-green-500 to-emerald-600' 
  },
  orphanage: { 
    icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>, 
    action: 'Request Food', 
    link: '/requests/new', 
    color: 'from-teal-500 to-emerald-600' 
  },
  admin: { 
    icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>, 
    action: 'Admin Panel', 
    link: '/admin', 
    color: 'from-teal-800 to-primary-900' 
  },
};

export default function DashboardPage() {
  const { user } = useAuth();
  const socket = useSocket();
  const [donations, setDonations] = useState([]);
  const [myActivity, setMyActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [liveCount, setLiveCount] = useState(0);
  const meta = roleGreeting[user.role];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [donRes, myRes] = await Promise.all([
          api.get('/donations?limit=6'),
          user.role === 'donor' ? api.get('/donations/my') : Promise.resolve({ data: [] }),
        ]);
        setDonations(donRes.data.donations || []);
        setLiveCount(donRes.data.total || 0);
        if (Array.isArray(myRes.data)) setMyActivity(myRes.data.slice(0, 3));
      } catch (err) {
        toast.error('Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user.role]);

  useEffect(() => {
    if (!socket) return;
    const handleNew = (donation) => {
      setDonations(prev => [donation, ...prev.slice(0, 5)]);
      setLiveCount(c => c + 1);
      toast.info(`New donation: ${donation.title}`, { autoClose: 3000 });
    };
    socket.on('new_donation', handleNew);
    return () => socket.off('new_donation', handleNew);
  }, [socket]);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`bg-gradient-to-r ${meta.color} rounded-3xl p-8 text-white mb-8 shadow-xl shadow-emerald-100`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm font-bold uppercase tracking-wider">{greeting}</p>
              <h1 className="text-3xl font-black mt-2 flex items-center gap-3">
                <span className="p-2 bg-white/20 rounded-xl">{meta.icon}</span>
                {user.name}
              </h1>
              <p className="text-white/80 mt-2 font-medium capitalize">{user.role} account{user.organizationName ? ` · ${user.organizationName}` : ''}</p>
              <Link to={meta.link} className="mt-6 inline-flex items-center gap-2 bg-white text-emerald-600 font-bold px-6 py-3 rounded-2xl transition-all hover:scale-105 active:scale-95 shadow-lg">
                {meta.action}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
              </Link>
            </div>
            <div className="text-right hidden sm:block bg-white/10 backdrop-blur-md p-6 rounded-[2rem] border border-white/20">
              <div className="text-4xl font-black">{liveCount}</div>
              <div className="text-white/80 text-xs font-bold uppercase tracking-widest mt-1">Live Donations</div>
              <div className="flex items-center gap-2 justify-end mt-3">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.8)]" />
                <span className="text-white/70 text-[10px] font-bold uppercase">Active Network</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
          {[
            { label: 'Total Donations', value: user.totalDonations || 0, icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg> },
            { label: 'Deliveries', value: user.totalDeliveries || 0, icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg> },
            { label: 'Following', value: user.following?.length || 0, icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg> },
            { label: 'Followers', value: user.followers?.length || 0, icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg> },
          ].map((stat, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center mb-4">{stat.icon}</div>
              <div className="text-3xl font-black text-gray-900">{stat.value}</div>
              <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Live Donations Feed */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-black text-gray-900">Nearby Opportunities</h2>
              <div className="flex items-center gap-1.5 px-3 py-1 bg-green-50 rounded-full">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                <span className="text-[10px] font-extrabold text-green-700 uppercase tracking-wider">Live</span>
              </div>
            </div>
            <Link to="/donations" className="text-sm font-bold text-primary-600 hover:text-primary-700 flex items-center gap-1 group">
              View All <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/></svg>
            </Link>
          </div>

          {loading ? (
            <Spinner center />
          ) : donations.length === 0 ? (
            <div className="bg-white rounded-[2.5rem] p-16 text-center border border-dashed border-gray-200">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-primary-600">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4m16 0L12 4m8 8l-8 8"/></svg>
              </div>
              <p className="text-gray-500 font-medium">No active donations in your area right now.</p>
              {user.role === 'donor' && (
                <Link to="/donations/new" className="mt-6 inline-block bg-primary-600 text-white font-bold px-8 py-3 rounded-2xl shadow-lg shadow-primary-100">
                  Post Initial Donation
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {donations.map(d => <DonationCard key={d._id} donation={d} />)}
            </div>
          )}
        </div>

        {/* Quick Access */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { to: '/map', icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/></svg>, label: 'Impact Map' },
            { to: '/requests', icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>, label: 'Open Requests' },
            { to: '/community', icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>, label: 'Community Feed' },
            { to: `/profile/${user._id}`, icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM4.5 18a8.5 8.5 0 0115 0z"/></svg>, label: 'My Profile' },
          ].map((link, i) => (
            <Link key={i} to={link.to} className="group bg-white rounded-[2rem] p-8 text-center border border-gray-100 hover:border-primary-100 hover:shadow-xl hover:shadow-primary-50 transition-all duration-300">
              <div className="w-14 h-14 rounded-2xl bg-gray-50 text-gray-400 group-hover:bg-primary-600 group-hover:text-white transition-all duration-300 flex items-center justify-center mx-auto mb-4 shadow-sm">
                {link.icon}
              </div>
              <div className="text-sm font-black text-gray-900 group-hover:text-primary-600 transition-colors">{link.label}</div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
