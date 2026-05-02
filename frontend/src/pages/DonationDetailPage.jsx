import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import Navbar from '../components/common/Navbar';
import Spinner from '../components/common/Spinner';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const statusSteps = ['available', 'accepted', 'picked_up', 'on_the_way', 'delivered'];
const statusLabels = { available: 'Available', accepted: 'Accepted', picked_up: 'Picked Up', on_the_way: 'On The Way', delivered: 'Delivered' };

export default function DonationDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [donation, setDonation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [comment, setComment] = useState('');
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    api.get(`/donations/${id}`)
      .then(res => {
        setDonation(res.data);
        setLiked(res.data.likes?.includes(user._id));
      })
      .catch(() => toast.error('Failed to load donation'))
      .finally(() => setLoading(false));
  }, [id, user._id]);

  const handleAction = async (action) => {
    setActionLoading(true);
    try {
      const res = await api.put(`/donations/${id}/${action}`);
      setDonation(res.data);
      const messages = {
        request: 'Donation requested successfully!',
        accept: 'Delivery accepted! Head to pickup location.',
        pickup: 'Marked as picked up',
        ontheway: 'Marked as on the way!',
        deliver: 'Delivery completed! Great job!'
      };
      toast.success(messages[action] || 'Action completed');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleLike = async () => {
    try {
      const res = await api.post(`/donations/${id}/like`);
      setLiked(res.data.liked);
      setDonation(prev => ({ ...prev, likes: Array(res.data.likes).fill(0) }));
    } catch { toast.error('Failed to update reaction'); }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    try {
      const res = await api.post(`/donations/${id}/comment`, { text: comment });
      setDonation(prev => ({ ...prev, comments: res.data }));
      setComment('');
    } catch { toast.error('Failed to post comment'); }
  };

  if (loading) return <div className="min-h-screen bg-[#fcfdfd]"><Navbar /><Spinner center /></div>;
  if (!donation) return <div className="min-h-screen bg-[#fcfdfd]"><Navbar /><div className="p-20 text-center font-black text-gray-400 uppercase tracking-widest">Donation not found</div></div>;

  const currentStepIdx = statusSteps.indexOf(donation.status);
  const isVolunteer = user.role === 'volunteer';
  const isDonor = donation.donor?._id === user._id;
  const isMyDelivery = donation.volunteer?._id === user._id;

  return (
    <div className="min-h-screen bg-[#fcfdfd]">
      <Navbar />
      <main className="max-w-6xl mx-auto px-6 py-12">
        <Link to="/donations" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-primary-600 transition-colors mb-10">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7"/></svg>
          Back to List
        </Link>

        <div className="grid lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-10">
            {/* Image & Header */}
            <div className="bg-white rounded-[3.5rem] overflow-hidden shadow-2xl shadow-gray-100 border border-gray-100">
              <div className="h-[400px] bg-gradient-to-br from-primary-50 to-emerald-50 flex items-center justify-center relative group">
                {donation.images?.[0] ? (
                  <img src={donation.images[0]} alt={donation.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                ) : (
                  <svg className="w-24 h-24 text-primary-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                )}
                {donation.isUrgent && (
                  <div className="absolute top-8 left-8 px-4 py-2 bg-red-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-xl animate-pulse">Priority Donation</div>
                )}
              </div>
              <div className="p-12">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight leading-tight">{donation.title}</h1>
                    <div className="flex items-center gap-4 mt-4">
                      <span className="px-3 py-1 bg-primary-50 text-primary-700 text-[10px] font-black uppercase tracking-widest rounded-lg">{donation.foodType}</span>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Added {new Date(donation.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <button onClick={handleLike} className={`p-4 rounded-2xl transition-all ${liked ? 'bg-red-50 text-red-500 shadow-lg shadow-red-100' : 'bg-gray-50 text-gray-300 hover:bg-gray-100'}`}>
                    <svg className="w-6 h-6" fill={liked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
                  </button>
                </div>
                <p className="text-gray-500 text-lg leading-relaxed mb-10">{donation.description}</p>

                <div className="grid sm:grid-cols-3 gap-6">
                  <div className="bg-gray-50 rounded-[2rem] p-6 border border-gray-100/50">
                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Quantity</div>
                    <div className="font-black text-gray-900 text-xl">{donation.quantity}</div>
                  </div>
                  <div className="bg-gray-50 rounded-[2rem] p-6 border border-gray-100/50">
                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Servings</div>
                    <div className="font-black text-gray-900 text-xl">{donation.servings || '--'} People</div>
                  </div>
                  <div className="bg-gray-50 rounded-[2rem] p-6 border border-gray-100/50">
                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Expires</div>
                    <div className="font-black text-gray-900 text-sm leading-tight">{new Date(donation.expiryTime).toLocaleDateString()}</div>
                  </div>
                </div>

                {donation.dietaryInfo?.length > 0 && (
                  <div className="mt-10 flex flex-wrap gap-2">
                    {donation.dietaryInfo.map(d => (
                      <span key={d} className="px-4 py-2 bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-widest rounded-xl border border-emerald-100">{d}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Progress Tracker */}
            {['accepted', 'picked_up', 'on_the_way', 'delivered'].includes(donation.status) && (
              <div className="bg-white rounded-[3.5rem] p-12 shadow-2xl shadow-gray-100 border border-gray-100">
                <h3 className="text-[10px] font-black text-primary-600 uppercase tracking-[0.2em] mb-10">Live Delivery Status</h3>
                <div className="flex items-center gap-2">
                  {statusSteps.map((step, i) => (
                    <div key={step} className="flex items-center flex-1">
                      <div className={`flex-shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center text-xs font-black transition-all duration-500 shadow-lg ${
                        i <= currentStepIdx ? 'bg-primary-600 text-white shadow-primary-200' : 'bg-gray-100 text-gray-300'
                      }`}>{i + 1}</div>
                      {i < statusSteps.length - 1 && (
                        <div className={`flex-1 h-1.5 mx-2 rounded-full transition-all duration-700 ${i < currentStepIdx ? 'bg-primary-600' : 'bg-gray-100'}`} />
                      )}
                    </div>
                  ))}
                </div>
                <div className="flex justify-between mt-6">
                  {statusSteps.map(s => <span key={s} className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{statusLabels[s]}</span>)}
                </div>
                {donation.status !== 'delivered' && (
                  <Link to={`/tracking/${donation._id}`} className="mt-10 w-full bg-primary-600 text-white py-5 rounded-[2rem] font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-primary-700 transition-all active:scale-[0.98] shadow-xl shadow-primary-200">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                    Track Live Location
                  </Link>
                )}
              </div>
            )}

            {/* Comments */}
            <div className="bg-white rounded-[3.5rem] p-12 shadow-2xl shadow-gray-100 border border-gray-100">
              <h3 className="text-[10px] font-black text-primary-600 uppercase tracking-[0.2em] mb-10">Community Comments</h3>
              <form onSubmit={handleComment} className="flex gap-4 mb-10">
                <input value={comment} onChange={e => setComment(e.target.value)} className="flex-1 bg-gray-50 border-transparent rounded-2xl px-6 py-4 text-sm font-bold focus:bg-white focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all outline-none" placeholder="Share your thoughts..." />
                <button type="submit" className="bg-primary-600 text-white px-8 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-primary-700 transition-all shadow-lg active:scale-95">Post</button>
              </form>
              <div className="space-y-6">
                <AnimatePresence>
                  {donation.comments?.map((c, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex gap-4 p-6 bg-gray-50/50 rounded-3xl border border-gray-100/50">
                      <div className="w-12 h-12 rounded-2xl bg-primary-100 flex items-center justify-center flex-shrink-0 shadow-sm">
                        <span className="text-xs text-primary-600 font-black uppercase">{c.user?.name?.[0]}</span>
                      </div>
                      <div>
                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{c.user?.name}</div>
                        <div className="text-sm text-gray-700 font-medium leading-relaxed">{c.text}</div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {(!donation.comments || donation.comments.length === 0) && (
                  <p className="text-center text-gray-300 text-xs font-bold uppercase tracking-widest py-4">No comments yet</p>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Donor info */}
            <div className="bg-white rounded-[3rem] p-10 shadow-2xl shadow-gray-100 border border-gray-100">
              <h3 className="text-[10px] font-black text-primary-600 uppercase tracking-widest mb-8">Shared By</h3>
              <Link to={`/profile/${donation.donor?._id}`} className="flex items-center gap-4 group">
                <div className="w-16 h-16 rounded-[1.5rem] bg-primary-100 flex items-center justify-center shadow-lg shadow-primary-50 group-hover:scale-105 transition-transform">
                  <span className="text-xl text-primary-600 font-black uppercase">{donation.donor?.name?.[0]}</span>
                </div>
                <div className="overflow-hidden">
                  <div className="font-black text-gray-900 text-lg truncate group-hover:text-primary-600 transition-colors">{donation.donor?.name}</div>
                  <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Certified Donor</div>
                </div>
              </Link>
            </div>

            {/* Location */}
            <div className="bg-white rounded-[3rem] p-10 shadow-2xl shadow-gray-100 border border-gray-100">
              <h3 className="text-[10px] font-black text-primary-600 uppercase tracking-widest mb-6">Collection Location</h3>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center flex-shrink-0 text-gray-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                </div>
                <p className="text-sm text-gray-600 font-bold leading-relaxed">{donation.pickupAddress}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-4">
              {donation.status === 'available' && user.role === 'orphanage' && !donation.recipient && (
                <button onClick={() => handleAction('request')} disabled={actionLoading} className="w-full bg-primary-600 text-white py-6 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] hover:bg-primary-700 transition-all active:scale-[0.98] shadow-2xl shadow-primary-200 disabled:opacity-60 flex items-center justify-center gap-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
                  {actionLoading ? '...' : 'Request This Food'}
                </button>
              )}
              {donation.status === 'available' && isVolunteer && (
                <button 
                  onClick={() => handleAction('accept')} 
                  disabled={actionLoading || !donation.recipient} 
                  className={`w-full py-6 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] transition-all active:scale-[0.98] shadow-2xl flex items-center justify-center gap-3 ${
                    donation.recipient 
                    ? 'bg-primary-600 text-white shadow-primary-200 hover:bg-primary-700' 
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"/></svg>
                  {!donation.recipient ? 'Waiting for NGO Request' : (actionLoading ? 'Accepting...' : 'Accept Delivery')}
                </button>
              )}
              {donation.status === 'accepted' && isMyDelivery && (
                <button onClick={() => handleAction('pickup')} disabled={actionLoading} className="w-full bg-primary-600 text-white py-6 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] hover:bg-primary-700 transition-all active:scale-[0.98] shadow-2xl shadow-primary-200 disabled:opacity-60 flex items-center justify-center gap-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
                  {actionLoading ? '...' : 'Mark Picked Up'}
                </button>
              )}
              {donation.status === 'picked_up' && isMyDelivery && (
                <button onClick={() => handleAction('ontheway')} disabled={actionLoading} className="w-full bg-blue-600 text-white py-6 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] hover:bg-blue-700 transition-all active:scale-[0.98] shadow-2xl shadow-blue-200 disabled:opacity-60 flex items-center justify-center gap-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                  {actionLoading ? '...' : 'Mark On The Way'}
                </button>
              )}
              {donation.status === 'on_the_way' && isMyDelivery && (
                <button onClick={() => handleAction('deliver')} disabled={actionLoading} className="w-full bg-emerald-600 text-white py-6 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] hover:bg-emerald-700 transition-all active:scale-[0.98] shadow-2xl shadow-emerald-200 disabled:opacity-60 flex items-center justify-center gap-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                  {actionLoading ? '...' : 'Mark Delivered'}
                </button>
              )}
              {donation.status !== 'delivered' && donation.status !== 'available' && (isDonor || isMyDelivery) && (
                <Link to={`/tracking/${donation._id}`} className="w-full bg-white text-gray-900 border border-gray-100 py-6 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] hover:bg-gray-50 transition-all active:scale-[0.98] shadow-xl flex items-center justify-center gap-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                  Track Live Location
                </Link>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
