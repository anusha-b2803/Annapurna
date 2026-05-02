import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/common/Navbar';
import DonationCard from '../components/common/DonationCard';
import Spinner from '../components/common/Spinner';
import api from '../utils/api';
import { toast } from 'react-toastify';

export default function CommunityPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('feed'); // feed, heroes, nearby

  const [postText, setPostText] = useState('');
  const [posting, setPosting] = useState(false);
  const [activePostId, setActivePostId] = useState(null);
  const [commentText, setCommentText] = useState('');

  const fetchPosts = async () => {
    setLoading(true);
    try {
      let url = '/donations?limit=20';
      if (view === 'nearby') {
        // Default to Chennai coordinates if geolocation not ready, but try to use real ones
        url += '&lat=13.0827&lng=80.2707&radius=10000';
      }
      const res = await api.get(url);
      setPosts(res.data.donations || []);
    } catch (err) {
      toast.error('Failed to load community feed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
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
        expiryTime: new Date(Date.now() + 86400000), // 24h
        pickupAddress: 'Community Feed',
        location: { type: 'Point', coordinates: [80.2707, 13.0827] }
      });
      toast.success('Story shared with community!');
      setPostText('');
      fetchPosts();
    } catch (err) {
      toast.error('Failed to share story');
    } finally {
      setPosting(false);
    }
  };

  const handleLike = async (postId) => {
    try {
      const res = await api.post(`/donations/${postId}/like`);
      setPosts(prev => prev.map(p => p._id === postId ? { ...p, likes: Array(res.data.likes).fill(0), isLiked: res.data.liked } : p));
    } catch {
      toast.error('Failed to react');
    }
  };

  const handleCommentSubmit = async (postId) => {
    if (!commentText.trim()) return;
    try {
      const res = await api.post(`/donations/${postId}/comment`, { text: commentText });
      setPosts(prev => prev.map(p => p._id === postId ? { ...p, comments: res.data } : p));
      setCommentText('');
      toast.success('Comment shared');
    } catch {
      toast.error('Failed to comment');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      <Navbar />
      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Community Header */}
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1 bg-primary-100 text-primary-700 text-[10px] font-black uppercase tracking-widest rounded-full border border-primary-200">Community Hub</span>
            </div>
            <h1 className="text-5xl font-black text-gray-900 tracking-tight mb-2">Community Feed</h1>
            <p className="text-gray-400 font-bold text-lg uppercase tracking-tight">Real-time impact across our network</p>
          </div>
          <div className="flex bg-white p-1.5 rounded-[1.2rem] shadow-xl border border-gray-100">
            {['feed', 'nearby', 'heroes'].map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  view === v ? 'bg-primary-600 text-white shadow-lg shadow-primary-200' : 'text-gray-400 hover:text-gray-700'
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        {/* Post Creation */}
        <div className="bg-white rounded-[2.5rem] p-8 shadow-2xl shadow-gray-100 mb-12 border border-gray-100 flex items-center gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 rounded-full translate-x-1/2 -translate-y-1/2 blur-2xl" />
          <div className="w-14 h-14 rounded-2xl bg-primary-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-primary-100 relative z-10">S</div>
          <input 
            type="text" 
            placeholder="Share your impact with the community..." 
            className="flex-1 bg-gray-50 border-transparent rounded-2xl px-6 py-4 text-sm font-bold focus:bg-white focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all outline-none"
            value={postText}
            onChange={e => setPostText(e.target.value)}
          />
          <button 
            onClick={handlePost}
            disabled={posting}
            className="bg-primary-600 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-primary-700 transition-all shadow-xl shadow-primary-100 active:scale-95 disabled:opacity-50"
          >
            {posting ? '...' : 'Post'}
          </button>
        </div>

        {/* Feed */}
        {loading ? (
          <div className="py-20"><Spinner center /></div>
        ) : posts.length === 0 ? (
          <div className="bg-white rounded-[3rem] p-32 text-center border-2 border-dashed border-gray-100">
            <h3 className="text-2xl font-black text-gray-900 mb-2">The feed is quiet</h3>
            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Be the first to share an update</p>
          </div>
        ) : (
          <div className="space-y-10">
            <AnimatePresence>
              {posts.map((post, i) => (
                <motion.div
                  key={post._id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white rounded-[3rem] shadow-2xl shadow-gray-100 border border-gray-100 overflow-hidden group"
                >
                  
                  {/* User Info */}
                  <div className="p-8 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-gray-50 overflow-hidden border border-gray-100 flex items-center justify-center font-black text-gray-400 text-xl group-hover:border-primary-200 transition-colors">
                        {post.donor?.avatar ? (
                          <img src={post.donor.avatar} alt="" className="w-full h-full object-cover" />
                        ) : (
                          post.donor?.name?.[0] || 'U'
                        )}
                      </div>
                      <div>
                        <Link to={`/profile/${post.donor?._id}`} className="font-black text-gray-900 text-lg hover:text-primary-600 transition-colors cursor-pointer">
                          {post.donor?.name || 'Community Member'}
                        </Link>
                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 mt-1">
                          <svg className="w-3 h-3 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                          <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                          <span className="w-1 h-1 bg-gray-200 rounded-full" />
                          <span>{post.pickupAddress || 'Verified Location'}</span>
                        </div>
                      </div>
                    </div>
                    <button className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-all">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 12h.01M12 12h.01M19 12h.01"/></svg>
                    </button>
                  </div>

                  {/* Content */}
                  <div className="px-8 pb-8">
                    <p className="text-gray-600 text-lg font-bold leading-relaxed">
                      Shared <span className="text-primary-600 font-black italic">"{post.quantity}"</span> of <span className="text-gray-900 font-black italic">"{post.title}"</span> with the community. 
                      {post.description && <span className="block mt-4 text-gray-400 font-medium italic border-l-4 border-primary-100 pl-4 bg-gray-50/50 py-4 rounded-r-2xl">"{post.description}"</span>}
                    </p>
                  </div>

                  {/* Image */}
                  {post.images?.[0] && (
                    <div className="px-8 pb-8">
                      <div className="aspect-video bg-gray-100 rounded-[2rem] overflow-hidden">
                        <img src={post.images[0]} alt="" className="w-full h-full object-cover" />
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="p-8 bg-gray-50/50 flex items-center gap-8 border-t border-gray-50">
                    <button 
                      onClick={() => handleLike(post._id)}
                      className={`flex items-center gap-2 transition-all text-[10px] font-black uppercase tracking-widest ${post.isLiked ? 'text-red-500' : 'text-primary-400/80 hover:text-primary-600'}`}
                    >
                      <svg className="w-5 h-5" fill={post.isLiked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
                      {post.likes?.length || 0} Likes
                    </button>
                    <button 
                      onClick={() => setActivePostId(activePostId === post._id ? null : post._id)}
                      className="flex items-center gap-2 text-primary-400/80 hover:text-primary-600 transition-all text-[10px] font-black uppercase tracking-widest"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
                      {post.comments?.length || 0} Comments
                    </button>
                  </div>

                  {/* Comment Section */}
                  <AnimatePresence>
                    {activePostId === post._id && (
                      <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden bg-gray-50/30 border-t border-gray-100">
                        <div className="p-8 space-y-6">
                          {/* Comment List */}
                          <div className="space-y-4">
                            {post.comments?.map((c, idx) => (
                              <div key={idx} className="flex gap-4">
                                <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center font-black text-primary-600 text-[10px]">
                                  {c.user?.name?.[0] || 'U'}
                                </div>
                                <div className="flex-1 bg-white p-4 rounded-2xl rounded-tl-none border border-gray-100 shadow-sm">
                                  <div className="text-[10px] font-black text-gray-900 uppercase tracking-widest mb-1">{c.user?.name || 'Community Member'}</div>
                                  <div className="text-sm text-gray-500 font-bold leading-relaxed">{c.text}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                          {/* Typing Area */}
                          <div className="flex gap-4 pt-4 border-t border-gray-100">
                            <input 
                              type="text" 
                              placeholder="Write a comment..." 
                              value={commentText}
                              onChange={e => setCommentText(e.target.value)}
                              onKeyPress={e => e.key === 'Enter' && handleCommentSubmit(post._id)}
                              className="flex-1 bg-white border border-gray-200 rounded-xl px-5 py-3 text-sm font-bold focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all outline-none shadow-sm"
                            />
                            <button 
                              onClick={() => handleCommentSubmit(post._id)}
                              className="bg-primary-600 text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-primary-100 active:scale-95 transition-all"
                            >
                              Post
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>
    </div>
  );
}
