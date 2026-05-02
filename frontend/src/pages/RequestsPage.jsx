import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import Navbar from '../components/common/Navbar';
import Spinner from '../components/common/Spinner';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const urgencyColor = {
  low: 'bg-slate-100 text-slate-600',
  medium: 'bg-teal-100 text-teal-700',
  high: 'bg-emerald-100 text-emerald-700',
  critical: 'bg-red-100 text-red-700 border border-red-200',
};

export default function RequestsPage() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/requests')
      .then(res => setRequests(res.data.requests || []))
      .catch(() => toast.error('Failed to load requests'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50/50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase tracking-widest rounded-full border border-emerald-200">Request Feed</span>
            </div>
            <h1 className="text-5xl font-black text-gray-900 tracking-tight mb-2">Food Requests</h1>
            <p className="text-gray-400 font-bold text-lg uppercase tracking-tight">Organizations in need of food support</p>
          </div>
          {(user.role === 'orphanage' || user.role === 'admin') && (
            <Link to="/requests/new" className="bg-primary-600 text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-primary-700 transition-all shadow-xl shadow-primary-100 active:scale-95 flex items-center gap-3">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"/></svg>
              New Request
            </Link>
          )}
        </div>

        {loading ? <div className="py-20"><Spinner center /></div> : requests.length === 0 ? (
          <div className="bg-white rounded-[3rem] p-32 text-center border-2 border-dashed border-gray-100">
            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-8 text-gray-200">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
            </div>
            <h3 className="text-2xl font-black text-gray-900 mb-2">No requests found right now</h3>
            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Check back later for new requests</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence>
              {requests.map((req, i) => (
                <motion.div key={req._id} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="group">
                  <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-300 relative overflow-hidden h-full flex flex-col">
                    <div className="flex items-start justify-between mb-6">
                      <h3 className="text-xl font-black text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-2 leading-tight">{req.title}</h3>
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex-shrink-0 ${urgencyColor[req.urgencyLevel]}`}>{req.urgencyLevel} Priority</span>
                    </div>
                    <p className="text-sm text-gray-400 font-medium mb-8 line-clamp-3 leading-relaxed italic border-l-4 border-primary-500 pl-4 bg-gray-50 py-3 rounded-r-xl">"{req.description}"</p>

                    <div className="space-y-4 text-xs font-bold text-gray-500 flex-grow">
                      <div className="flex items-center gap-3">
                        <svg className="w-4 h-4 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
                        <span className="text-gray-900 uppercase tracking-widest">{req.requester?.organizationName || req.requester?.name}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-2xl">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 01-6.001 0M18 7l-3 9m3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"/></svg>
                          <span className="text-[10px] uppercase tracking-widest">{req.quantity}</span>
                        </div>
                        <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-2xl">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
                          <span className="text-[10px] uppercase tracking-widest">{req.beneficiaryCount || req.servingsNeeded} units</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                        <span className="text-[10px] uppercase tracking-widest">Required by {new Date(req.requiredBy).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                        <span className="text-[10px] uppercase tracking-widest truncate">{req.deliveryAddress}</span>
                      </div>
                    </div>

                    {req.dietaryRestrictions?.length > 0 && (
                      <div className="mt-6 flex flex-wrap gap-2">
                        {req.dietaryRestrictions.map(d => (
                          <span key={d} className="px-3 py-1 bg-primary-50 text-primary-700 text-[9px] font-black uppercase tracking-widest rounded-lg border border-primary-100">{d}</span>
                        ))}
                      </div>
                    )}

                    <div className="mt-8 pt-6 border-t border-gray-50 flex items-center justify-between">
                      <span className={`px-4 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${req.status === 'open' ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-50 text-gray-400'}`}>
                        Status: {req.status}
                      </span>
                      {(user.role === 'donor' || user.role === 'volunteer') && req.status === 'open' && (
                        <Link to={`/donations/new?recipient=${req.requester?._id}&requestId=${req._id}&title=${encodeURIComponent(req.title)}`} className="text-[10px] font-black uppercase tracking-widest text-primary-600 hover:text-primary-700 transition-colors flex items-center gap-2 group-hover:translate-x-1 transition-transform">
                          Help Now
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
                        </Link>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>
    </div>
  );
}
