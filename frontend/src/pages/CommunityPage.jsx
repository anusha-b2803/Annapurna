import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/common/Navbar';
import DonationCard from '../components/common/DonationCard';
import RequestCard from '../components/common/RequestCard';
import Spinner from '../components/common/Spinner';
import api from '../utils/api';
import { toast } from 'react-toastify';

export default function CommunityPage() {
  const [data, setData] = useState([]);
  const [leaderboard, setLeaderboard] = useState({ donors: [], volunteers: [] });
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('donations'); // donations, requests, heroes

  const [postText, setPostText] = useState('');
  const [posting, setPosting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (view === 'donations') {
        const res = await api.get('/donations?limit=30');
        setData(res.data.donations || []);
      } else if (view === 'requests') {
        const res = await api.get('/requests?limit=30');
        setData(res.data.requests || []);
      } else if (view === 'heroes') {
        const res = await api.get('/social/leaderboard');
        setLeaderboard(res.data);
      }
    } catch (err) {
      toast.error(`Failed to load ${view}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [view]);

  const handlePost = async () => {
    if (!postText.trim()) return;
    setPosting(true);
    try {
      await api.post('/donations', {
        title: 'Community Story',
        description: postText,
        foodType: 'other',
        quantity: 'Impact Update',
        expiryTime: new Date(Date.now() + 86400000),
        pickupAddress: 'Community Hub',
        location: { type: 'Point', coordinates: [80.2707, 13.0827] }
      });
      toast.success('Story shared!');
      setPostText('');
      if (view === 'donations') fetchData();
    } catch {
      toast.error('Failed to post');
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      <Navbar />
      <main className="max-w-6xl mx-auto px-6 py-12">
        {/* Header Section */}
        <div className="mb-12 flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1 bg-primary-100 text-primary-700 text-[10px] font-black uppercase tracking-widest rounded-full border border-primary-200">Community Hub</span>
            </div>
            <h1 className="text-6xl font-black text-gray-900 tracking-tight mb-4 capitalize">
              {view === 'heroes' ? 'Community Heroes' : `Live ${view}`}
            </h1>
            <p className="text-gray-400 font-bold text-lg uppercase tracking-tight">
              {view === 'donations' && "Real-time feed of food items ready for distribution"}
              {view === 'requests' && "Urgent food requirements from local NGOs and Shelters"}
              {view === 'heroes' && "Celebrating our most active donors and volunteers"}
            </p>
          </div>
          
          <div className="flex bg-white p-2 rounded-[1.5rem] shadow-2xl border border-gray-100 self-start lg:self-auto">
            {['donations', 'requests', 'heroes'].map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-8 py-3.5 rounded-[1.2rem] text-[10px] font-black uppercase tracking-widest transition-all ${
                  view === v ? 'bg-primary-600 text-white shadow-xl shadow-primary-200' : 'text-gray-400 hover:text-gray-700'
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        {loading ? (
          <div className="py-20 flex justify-center"><Spinner /></div>
        ) : view === 'heroes' ? (
          <div className="grid md:grid-cols-2 gap-10">
             {/* Donors Leaderboard */}
             <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-gray-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-amber-500/5 rounded-full translate-x-1/3 -translate-y-1/3 blur-3xl" />
                <h2 className="text-3xl font-black text-gray-900 mb-10 flex items-center gap-4 relative z-10">
                   <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-500 shadow-sm">
                      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                   </div>
                   Top Donors
                </h2>
                <div className="space-y-6 relative z-10">
                   {leaderboard.donors.map((user, i) => (
                      <Link to={`/profile/${user._id}`} key={user._id} className="flex items-center justify-between p-6 bg-gray-50/50 hover:bg-white rounded-[2rem] border border-transparent hover:border-amber-200 hover:shadow-xl hover:shadow-amber-100 transition-all group">
                         <div className="flex items-center gap-5">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl border-2 ${i === 0 ? 'bg-amber-100 border-amber-300 text-amber-600' : 'bg-white border-gray-100 text-gray-400'}`}>
                               {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover rounded-2xl" /> : (i + 1)}
                            </div>
                            <div>
                               <p className="font-black text-gray-900 text-lg group-hover:text-amber-600 transition-colors">{user.name}</p>
                               <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{user.organizationName || 'Community Member'}</p>
                            </div>
                         </div>
                         <div className="text-right">
                            <p className="text-2xl font-black text-amber-600">{user.totalDonations}</p>
                            <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Contributions</p>
                         </div>
                      </Link>
                   ))}
                </div>
             </div>
             
             {/* Volunteers Leaderboard */}
             <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-gray-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-primary-500/5 rounded-full translate-x-1/3 -translate-y-1/3 blur-3xl" />
                <h2 className="text-3xl font-black text-gray-900 mb-10 flex items-center gap-4 relative z-10">
                   <div className="w-12 h-12 rounded-2xl bg-primary-50 flex items-center justify-center text-primary-500 shadow-sm">
                      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                   </div>
                   Top Volunteers
                </h2>
                <div className="space-y-6 relative z-10">
                   {leaderboard.volunteers.map((user, i) => (
                      <Link to={`/profile/${user._id}`} key={user._id} className="flex items-center justify-between p-6 bg-gray-50/50 hover:bg-white rounded-[2rem] border border-transparent hover:border-primary-200 hover:shadow-xl hover:shadow-primary-100 transition-all group">
                         <div className="flex items-center gap-5">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl border-2 ${i === 0 ? 'bg-primary-100 border-primary-300 text-primary-600' : 'bg-white border-gray-100 text-gray-400'}`}>
                               {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover rounded-2xl" /> : (i + 1)}
                            </div>
                            <div>
                               <p className="font-black text-gray-900 text-lg group-hover:text-primary-600 transition-colors">{user.name}</p>
                               <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Active Member</p>
                            </div>
                         </div>
                         <div className="text-right">
                            <p className="text-2xl font-black text-primary-600">{user.totalDeliveries}</p>
                            <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Deliveries</p>
                         </div>
                      </Link>
                   ))}
                </div>
             </div>
          </div>
        ) : (
          <div className="space-y-12">
            {/* Post Creation (Only for Donations View) */}
            {view === 'donations' && (
              <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 flex flex-col md:flex-row items-center gap-6 relative overflow-hidden mb-12">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 rounded-full translate-x-1/2 -translate-y-1/2 blur-2xl" />
                <div className="w-14 h-14 rounded-2xl bg-primary-600 flex items-center justify-center text-white font-black text-xl relative z-10 shadow-lg shadow-primary-100">S</div>
                <input 
                  type="text" 
                  placeholder="Share a community story or update..." 
                  className="flex-1 w-full md:w-auto bg-gray-50 border-transparent rounded-2xl px-6 py-4 text-sm font-bold focus:bg-white focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all outline-none"
                  value={postText}
                  onChange={e => setPostText(e.target.value)}
                />
                <button 
                  onClick={handlePost}
                  disabled={posting}
                  className="bg-primary-600 text-white px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-primary-700 transition-all shadow-xl shadow-primary-100 active:scale-95 disabled:opacity-50 w-full md:w-auto"
                >
                  {posting ? 'Sharing...' : 'Share Story'}
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-10">
               <AnimatePresence mode='popLayout'>
                  {data.length === 0 ? (
                    <motion.div 
                      initial={{ opacity: 0 }} 
                      animate={{ opacity: 1 }} 
                      className="col-span-full py-40 text-center bg-white rounded-[3rem] border-2 border-dashed border-gray-100 shadow-sm"
                    >
                       <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-200">
                          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-3.586a1 1 0 00-.707.293l-1.414 1.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-1.414-1.414A1 1 0 006.586 13H4"/></svg>
                       </div>
                       <p className="text-gray-400 font-black uppercase tracking-[0.2em] text-xs">No active {view} found at the moment</p>
                    </motion.div>
                  ) : (
                    data.map((item, i) => (
                      <motion.div
                        key={item._id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.4, delay: i * 0.05 }}
                      >
                         {view === 'donations' ? (
                           <DonationCard donation={item} />
                         ) : (
                           <RequestCard request={item} />
                         )}
                      </motion.div>
                    ))
                  )}
               </AnimatePresence>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
