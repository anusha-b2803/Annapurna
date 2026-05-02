import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/common/Navbar';
import Spinner from '../components/common/Spinner';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

export default function CommunityPage() {
  const { user } = useAuth();
  const [data, setData] = useState([]);
  const [leaderboard, setLeaderboard] = useState({ donors: [], volunteers: [] });
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('all'); // all, donations, requests, heroes

  const [postText, setPostText] = useState('');
  const [posting, setPosting] = useState(false);
  const [commentingOn, setCommentingOn] = useState(null);
  const [commentText, setCommentText] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      if (view === 'all') {
        const [donationsRes, requestsRes] = await Promise.all([
          api.get('/donations?limit=20'),
          api.get('/requests?limit=20')
        ]);
        
        const donations = (donationsRes.data.donations || []).map(d => ({ ...d, itemType: 'donation' }));
        const requests = (requestsRes.data.requests || []).map(r => ({ ...r, itemType: 'request' }));
        
        const combined = [...donations, ...requests].sort((a, b) => 
          new Date(b.createdAt) - new Date(a.createdAt)
        );
        setData(combined);
      } else if (view === 'donations') {
        const res = await api.get('/donations?limit=30');
        setData((res.data.donations || []).map(d => ({ ...d, itemType: 'donation' })));
      } else if (view === 'requests') {
        const res = await api.get('/requests?limit=30');
        setData((res.data.requests || []).map(r => ({ ...r, itemType: 'request' })));
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
        servings: 1,
        expiryTime: new Date(Date.now() + 86400000),
        pickupAddress: 'Community Hub',
        location: { type: 'Point', coordinates: [80.2707, 13.0827] }
      });
      toast.success('Story shared!');
      setPostText('');
      if (view !== 'heroes') fetchData();
    } catch {
      toast.error('Failed to post');
    } finally {
      setPosting(false);
    }
  };

  const handleLike = async (id, type) => {
    try {
      const endpoint = type === 'donation' ? `/donations/${id}/like` : `/requests/${id}/like`;
      const res = await api.post(endpoint);
      setData(prev => prev.map(item => {
        if (item._id === id) {
          const newLikes = res.data.liked 
            ? [...(item.likes || []), user._id]
            : (item.likes || []).filter(l => l !== user._id);
          return { ...item, likes: newLikes };
        }
        return item;
      }));
    } catch {
      toast.error('Failed to update reaction');
    }
  };

  const handleComment = async (id, type) => {
    if (!commentText.trim()) return;
    try {
      const endpoint = type === 'donation' ? `/donations/${id}/comment` : `/requests/${id}/comment`;
      const res = await api.post(endpoint, { text: commentText });
      setData(prev => prev.map(item => {
        if (item._id === id) return { ...item, comments: res.data };
        return item;
      }));
      setCommentText('');
      setCommentingOn(null);
      toast.success('Comment added');
    } catch {
      toast.error('Failed to add comment');
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-8">
        {/* Header Filters */}
        <div className="mb-8 overflow-x-auto whitespace-nowrap pb-4 no-scrollbar">
          <div className="flex gap-4">
            {[
              { id: 'all', label: 'All Feed' },
              { id: 'donations', label: 'Donations' },
              { id: 'requests', label: 'Requests' },
              { id: 'heroes', label: 'Top Heroes' }
            ].map((v) => (
              <button
                key={v.id}
                onClick={() => setView(v.id)}
                className={`px-5 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all border ${
                  view === v.id ? 'bg-black text-white border-black' : 'bg-gray-50 text-gray-400 border-gray-100 hover:border-gray-200'
                }`}
              >
                {v.label}
              </button>
            ))}
          </div>
        </div>

        {/* Post Creation */}
        {view !== 'heroes' && (
          <div className="mb-10 p-6 bg-gray-50 rounded-3xl border border-gray-100">
             <div className="flex gap-4 items-center">
                <div className="w-12 h-12 rounded-full bg-primary-600 flex items-center justify-center text-white font-black">
                   {user?.name?.[0] || 'U'}
                </div>
                <input 
                  type="text" 
                  placeholder="Share your impact story..." 
                  className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-bold placeholder-gray-400"
                  value={postText}
                  onChange={e => setPostText(e.target.value)}
                />
                <button 
                  onClick={handlePost}
                  disabled={posting}
                  className="text-primary-600 font-black text-xs uppercase tracking-widest disabled:opacity-50"
                >
                  Post
                </button>
             </div>
          </div>
        )}

        {/* Feed Content */}
        <div className="space-y-12">
          {loading ? (
            <div className="py-20 flex justify-center"><Spinner /></div>
          ) : view === 'heroes' ? (
            <div className="space-y-12">
               {/* Spotlight */}
               {leaderboard.donors?.[0] && (
                 <div className="bg-gradient-to-br from-amber-400 to-orange-500 rounded-[3rem] p-10 text-white shadow-2xl shadow-amber-100">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] mb-4 text-white/80">
                       <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                       Top Donor of the Month
                    </div>
                    <div className="flex items-center gap-6">
                       <div className="w-24 h-24 rounded-[2rem] bg-white/20 backdrop-blur-md flex items-center justify-center text-4xl font-black">
                          {leaderboard.donors[0].name[0]}
                       </div>
                       <div>
                          <h2 className="text-4xl font-black tracking-tight">{leaderboard.donors[0].name}</h2>
                          <p className="text-white/80 font-bold uppercase tracking-widest text-xs mt-1">{leaderboard.donors[0].organizationName || 'Individual'}</p>
                          <div className="mt-4 inline-flex items-center gap-2 bg-white text-orange-600 px-4 py-2 rounded-full font-black text-xs uppercase tracking-widest shadow-xl">
                             {leaderboard.donors[0].totalDonations} Impactful Donations
                          </div>
                       </div>
                    </div>
                 </div>
               )}

               <div className="grid gap-12">
                  {/* Donors List */}
                  <div>
                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6 ml-4">Hero Donors</h3>
                    <div className="space-y-4">
                      {leaderboard.donors.map((u, i) => (
                        <Link to={`/profile/${u._id}`} key={u._id} className="flex items-center justify-between p-6 bg-gray-50 rounded-3xl hover:bg-white border border-transparent hover:border-gray-100 transition-all group">
                          <div className="flex items-center gap-5">
                            <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center text-amber-600 font-black text-sm">
                              {i + 1}
                            </div>
                            <div>
                              <p className="font-black text-gray-900">{u.name}</p>
                              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{u.organizationName || 'Individual'}</p>
                            </div>
                          </div>
                          <div className="text-right">
                             <span className="font-black text-amber-600">{u.totalDonations}</span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>

                  {/* Volunteers List */}
                  <div>
                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6 ml-4">Hero Volunteers</h3>
                    <div className="space-y-4">
                      {leaderboard.volunteers.map((u, i) => (
                        <Link to={`/profile/${u._id}`} key={u._id} className="flex items-center justify-between p-6 bg-gray-50 rounded-3xl hover:bg-white border border-transparent hover:border-gray-100 transition-all group">
                          <div className="flex items-center gap-5">
                            <div className="w-12 h-12 rounded-full bg-primary-50 flex items-center justify-center text-primary-600 font-black text-sm">
                              {i + 1}
                            </div>
                            <div>
                              <p className="font-black text-gray-900">{u.name}</p>
                              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Deliveries</p>
                            </div>
                          </div>
                          <div className="text-right">
                             <span className="font-black text-primary-600">{u.totalDeliveries}</span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
               </div>
            </div>
          ) : (
            <div className="space-y-16">
               <AnimatePresence mode='popLayout'>
                  {data.length === 0 ? (
                    <div className="py-20 text-center">
                       <p className="text-gray-300 font-black uppercase tracking-widest text-xs">No updates yet</p>
                    </div>
                  ) : (
                    data.map((item, i) => (
                      <motion.div
                        key={item._id}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: i * 0.1 }}
                        className="bg-white"
                      >
                         {/* Post Header */}
                         <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                               <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-50">
                                  {item.donor?.avatar || item.requester?.avatar ? (
                                    <img src={item.donor?.avatar || item.requester?.avatar} className="w-full h-full object-cover" alt="" />
                                  ) : (
                                    <span className="font-black text-xs text-gray-400 uppercase">{(item.donor?.name || item.requester?.name)?.[0]}</span>
                                  )}
                               </div>
                               <div>
                                  <Link to={`/profile/${item.donor?._id || item.requester?._id}`} className="font-black text-sm text-gray-900 hover:text-primary-600 transition-colors">
                                     {item.donor?.name || item.requester?.name}
                                  </Link>
                                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                                     {item.itemType === 'donation' ? 'Shared a Donation' : 'Requested Help'}
                                  </p>
                               </div>
                            </div>
                            <div className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${
                              item.itemType === 'donation' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                            }`}>
                               {item.itemType}
                            </div>
                         </div>

                         {/* Post Image / Media */}
                         <Link to={item.itemType === 'donation' ? `/donations/${item._id}` : `/requests/${item._id}`} className="block relative aspect-square rounded-[2rem] overflow-hidden bg-gray-50 group border border-gray-100">
                            {item.images?.[0] ? (
                              <img src={item.images[0]} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="" />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                                 <svg className="w-12 h-12 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                              </div>
                            )}
                            {item.isUrgent && (
                              <div className="absolute top-6 left-6 px-4 py-2 bg-red-600 text-white text-[9px] font-black uppercase tracking-widest rounded-full shadow-xl">Urgent</div>
                            )}
                         </Link>

                         {/* Post Actions */}
                         <div className="mt-6 flex items-center justify-between">
                            <div className="flex items-center gap-6">
                               <button 
                                 onClick={() => handleLike(item._id, item.itemType)}
                                 className={`transition-colors ${item.likes?.includes(user?._id) ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}`}
                               >
                                  <svg className="w-6 h-6" fill={item.likes?.includes(user?._id) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
                               </button>
                               <button 
                                 onClick={() => setCommentingOn(commentingOn === item._id ? null : item._id)}
                                 className="text-gray-400 hover:text-primary-600 transition-colors"
                               >
                                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
                               </button>
                            </div>
                            <Link to={item.itemType === 'donation' ? `/donations/${item._id}` : `/requests/${item._id}`} className="px-5 py-2 bg-gray-900 text-white text-[9px] font-black uppercase tracking-widest rounded-full hover:bg-primary-600 transition-all shadow-lg active:scale-95">
                               View Details
                            </Link>
                         </div>

                         {/* Like Count */}
                         {(item.likes?.length > 0) && (
                           <div className="mt-3 px-1">
                              <p className="text-xs font-black text-gray-900">{item.likes.length} likes</p>
                           </div>
                         )}

                         {/* Post Content */}
                         <div className="mt-2">
                            <p className="text-sm text-gray-900 leading-relaxed">
                               <span className="font-black mr-2">{item.donor?.name || item.requester?.name}</span>
                               {item.description}
                            </p>
                            
                            {/* Comments Preview */}
                            {item.comments?.length > 0 && (
                               <div className="mt-3 space-y-2">
                                  {item.comments.slice(-2).map((c, ci) => (
                                    <p key={ci} className="text-xs text-gray-600">
                                       <span className="font-bold mr-2">{c.user?.name || 'User'}</span>
                                       {c.text}
                                    </p>
                                  ))}
                                  {item.comments.length > 2 && (
                                    <Link to={item.itemType === 'donation' ? `/donations/${item._id}` : `/requests/${item._id}`} className="text-[10px] font-bold text-gray-400 hover:text-gray-600">View all {item.comments.length} comments</Link>
                                  )}
                               </div>
                            )}

                            <div className="mt-3 flex items-center gap-4">
                               <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{item.foodType}</span>
                               <span className="w-1 h-1 bg-gray-200 rounded-full" />
                               <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{new Date(item.createdAt).toLocaleDateString()}</span>
                            </div>
                         </div>

                         <AnimatePresence>
                            {commentingOn === item._id && (
                               <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-6 pt-6 border-t border-gray-50 flex gap-4">
                                  <input 
                                    autoFocus
                                    type="text" 
                                    placeholder="Add a comment..." 
                                    className="flex-1 bg-gray-50 border-transparent rounded-xl px-4 py-3 text-sm font-medium focus:bg-white focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all outline-none"
                                    value={commentText}
                                    onChange={e => setCommentText(e.target.value)}
                                    onKeyPress={e => e.key === 'Enter' && handleComment(item._id, item.itemType)}
                                  />
                                  <button 
                                    onClick={() => handleComment(item._id, item.itemType)}
                                    className="text-primary-600 font-black text-[10px] uppercase tracking-widest px-4 hover:text-primary-700 transition-colors"
                                  >
                                    Post
                                  </button>
                               </motion.div>
                            )}
                         </AnimatePresence>
                      </motion.div>
                    ))
                  )}
               </AnimatePresence>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
