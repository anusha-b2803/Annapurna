import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/common/Navbar';
import DonationCard from '../components/common/DonationCard';
import Spinner from '../components/common/Spinner';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import api from '../utils/api';
import { toast } from 'react-toastify';

const FOOD_TYPES = ['all', 'cooked', 'raw', 'packaged', 'beverages', 'other'];
const STATUSES = ['available', 'accepted', 'picked_up', 'on_the_way', 'delivered'];

export default function DonationsPage() {
  const { user } = useAuth();
  const socket = useSocket();
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [foodType, setFoodType] = useState('all');
  const [status, setStatus] = useState('available');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [myView, setMyView] = useState(false);
  const [nearby, setNearby] = useState(false);
  const [coords, setCoords] = useState(null);

  const fetchDonations = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ status, page, limit: 12 });
      if (foodType !== 'all') params.set('foodType', foodType);
      if (nearby && coords) {
        params.set('lat', coords.lat);
        params.set('lng', coords.lng);
        params.set('radius', 10000);
      }
      const endpoint = myView ? '/donations/my' : `/donations?${params}`;
      const res = await api.get(endpoint);
      if (myView) { setDonations(res.data); setTotal(res.data.length); }
      else { setDonations(res.data.donations); setTotal(res.data.total); }
    } catch { toast.error('Failed to load donations'); }
    finally { setLoading(false); }
  }, [foodType, status, page, myView, nearby, coords]);

  useEffect(() => { fetchDonations(); }, [fetchDonations]);

  const toggleNearby = () => {
    if (!nearby) {
      navigator.geolocation.getCurrentPosition(
        pos => { setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }); setNearby(true); },
        () => { toast.error('Location access denied'); setNearby(false); }
      );
    } else {
      setNearby(false);
      setCoords(null);
    }
  };

  useEffect(() => {
    if (!socket || myView) return;
    const handleNew = (d) => {
      if (status === 'available') setDonations(prev => [d, ...prev]);
    };
    socket.on('new_donation', handleNew);
    socket.on('donation_accepted', fetchDonations);
    socket.on('donation_delivered', fetchDonations);
    return () => {
      socket.off('new_donation', handleNew);
      socket.off('donation_accepted', fetchDonations);
      socket.off('donation_delivered', fetchDonations);
    };
  }, [socket, status, myView, fetchDonations]);

  return (
    <div className="min-h-screen bg-gray-50/50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1 bg-primary-100 text-primary-700 text-[10px] font-black uppercase tracking-widest rounded-full border border-primary-200">Active Donations</span>
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
            </div>
            <h1 className="text-5xl font-black text-gray-900 tracking-tight mb-2">Food List</h1>
            <p className="text-gray-400 font-bold text-lg uppercase tracking-tight">{total} items available to share</p>
          </div>
          <div className="flex gap-4">
            <button onClick={() => setMyView(!myView)} className={`px-8 py-4 rounded-2xl font-black text-sm transition-all shadow-lg active:scale-95 border-2 ${myView ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-gray-600 border-gray-100 hover:border-primary-200'}`}>
              {myView ? 'Show All Donations' : 'My History'}
            </button>
            {user.role === 'donor' && (
              <Link to="/donations/new" className="bg-primary-600 text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-primary-700 transition-all shadow-xl shadow-primary-100 active:scale-95 flex items-center gap-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"/></svg>
                New Donation
              </Link>
            )}
          </div>
        </div>

        {/* Filters */}
        {!myView && (
          <div className="bg-white p-6 rounded-[2rem] shadow-xl shadow-gray-100 border border-gray-100 mb-10 flex flex-wrap items-center justify-between gap-6">
            <div className="flex gap-2 flex-wrap">
              {FOOD_TYPES.map(ft => (
                <button key={ft} onClick={() => { setFoodType(ft); setPage(1); }}
                  className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                    foodType === ft ? 'bg-primary-600 text-white shadow-lg shadow-primary-200' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                  }`}>{ft}</button>
              ))}
            </div>
            <div className="flex items-center gap-6">
              {(user.role === 'volunteer' || user.role === 'orphanage') && (
                <button onClick={toggleNearby} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${nearby ? 'bg-primary-600 text-white border-primary-600 shadow-lg shadow-primary-100' : 'bg-gray-50 text-gray-400 border-gray-100'}`}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                  {nearby ? 'Nearby View ON' : 'Show Nearby'}
                </button>
              )}
              <div className="flex items-center gap-4">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Filter by Status</span>
                <select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}
                  className="bg-gray-50 border-2 border-transparent focus:border-primary-500 rounded-xl px-4 py-2.5 text-xs font-black uppercase tracking-widest text-gray-700 outline-none transition-all">
                  {STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Donations Grid */}
        {loading ? (
          <div className="py-20"><Spinner center /></div>
        ) : donations.length === 0 ? (
          <div className="bg-white rounded-[3rem] p-32 text-center border-2 border-dashed border-gray-100">
            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-8 text-gray-200">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
            </div>
            <h3 className="text-2xl font-black text-gray-900 mb-2">No donations found</h3>
            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Be the first to share something!</p>
            {user.role === 'donor' && <Link to="/donations/new" className="bg-primary-600 text-white px-8 py-3 rounded-2xl font-black text-sm uppercase tracking-widest mt-8 inline-block shadow-lg hover:bg-primary-700 transition-all">Start Donating</Link>}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            <AnimatePresence>
              {donations.map((d, i) => (
                <motion.div key={d._id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ delay: i * 0.05 }}>
                  <DonationCard donation={d} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Pagination */}
        {!myView && total > 12 && (
          <div className="flex justify-center items-center gap-6 mt-16">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="w-12 h-12 rounded-2xl bg-white border border-gray-100 flex items-center justify-center text-gray-400 hover:text-primary-600 hover:shadow-lg disabled:opacity-30 transition-all">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7"/></svg>
            </button>
            <div className="px-6 py-2 bg-primary-600 rounded-full shadow-lg shadow-primary-100">
              <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Page {page} of {Math.ceil(total / 12)}</span>
            </div>
            <button onClick={() => setPage(p => p + 1)} disabled={page >= Math.ceil(total / 12)} className="w-12 h-12 rounded-2xl bg-white border border-gray-100 flex items-center justify-center text-gray-400 hover:text-primary-600 hover:shadow-lg disabled:opacity-30 transition-all">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7"/></svg>
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
