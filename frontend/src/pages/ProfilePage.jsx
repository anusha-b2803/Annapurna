import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/common/Navbar';
import DonationCard from '../components/common/DonationCard';
import Spinner from '../components/common/Spinner';
import api from '../utils/api';
import { toast } from 'react-toastify';

export default function ProfilePage() {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const [user, setUser] = useState(null);
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/social/profile/${id}`);
        setUser(res.data.profile);
        setDonations(res.data.donations || []);
        setIsFollowing(res.data.profile.followers?.some(f => f._id === currentUser._id));
      } catch (err) {
        toast.error('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [id, currentUser._id]);

  const handleFollow = async () => {
    try {
      await api.post(`/social/follow/${id}`);
      setIsFollowing(!isFollowing);
      toast.success(isFollowing ? 'Unfollowed' : 'Following');
    } catch (err) {
      toast.error('Action failed');
    }
  };

  if (loading) return <Spinner center />;
  if (!user) return <div className="text-center py-20 text-gray-500 font-bold">User not found</div>;

  return (
    <div className="min-h-screen bg-gray-50/50">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-12">
        {/* Profile Header */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden mb-10">
          <div className="h-48 bg-gradient-to-r from-primary-600 via-emerald-500 to-teal-400" />
          <div className="px-10 pb-10">
            <div className="relative flex justify-between items-end -mt-16 mb-8">
              <div className="p-2 bg-white rounded-[2rem] shadow-xl">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-32 h-32 rounded-[1.5rem] object-cover" />
                ) : (
                  <div className="w-32 h-32 rounded-[1.5rem] bg-primary-50 flex items-center justify-center text-5xl text-primary-600 font-black">
                    {user.name[0]}
                  </div>
                )}
              </div>
              <div className="flex gap-4 mb-4">
                {currentUser._id === id ? (
                  <Link to="/settings" className="bg-primary-600 text-white px-8 py-3 rounded-2xl font-bold text-sm hover:bg-primary-700 transition-all shadow-lg active:scale-95">Edit Profile</Link>
                ) : (
                  <button onClick={handleFollow} className={`px-8 py-3 rounded-2xl font-black text-sm transition-all shadow-lg active:scale-95 ${isFollowing ? 'bg-gray-100 text-gray-600' : 'bg-primary-600 text-white'}`}>
                    {isFollowing ? 'Following' : 'Follow'}
                  </button>
                )}
              </div>
            </div>
            
            <div className="grid lg:grid-cols-3 gap-12">
              <div className="lg:col-span-2">
                <div className="flex items-center gap-4 mb-2">
                  <h1 className="text-4xl font-black text-gray-900 tracking-tight">{user.name}</h1>
                  <span className="px-3 py-1 bg-primary-50 text-primary-700 text-[10px] font-black uppercase tracking-widest rounded-full border border-primary-100">Verified {user.role}</span>
                </div>
                <p className="text-gray-400 font-bold text-sm mb-6 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
                  {user.organizationName || 'Community Member'}
                </p>
                <p className="text-lg text-gray-600 leading-relaxed font-medium mb-8 bg-gray-50 p-6 rounded-3xl border border-gray-100 italic">
                  "{user.bio || "Sharing food to spread hope in our community."}"
                </p>
                
                <div className="flex items-center gap-10">
                  <div className="group cursor-default">
                    <div className="font-black text-gray-900 text-3xl group-hover:text-primary-600 transition-colors">{user.followers?.length || 0}</div>
                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mt-1">Followers</div>
                  </div>
                  <div className="group cursor-default">
                    <div className="font-black text-gray-900 text-3xl group-hover:text-primary-600 transition-colors">{user.following?.length || 0}</div>
                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mt-1">Following</div>
                  </div>
                  <div className="group cursor-default">
                    <div className="font-black text-gray-900 text-3xl group-hover:text-primary-600 transition-colors">{user.rating?.toFixed(1) || '5.0'}</div>
                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mt-1">Trust Rating</div>
                  </div>
                </div>

                {/* Contact Info (Visible to owner or participants if enabled by API) */}
                {(user.phone || user.address) && (
                  <div className="mt-8 pt-8 border-t border-gray-100 flex flex-wrap gap-6">
                    {user.phone && (
                      <div className="flex items-center gap-3 bg-gray-50 px-5 py-3 rounded-2xl border border-gray-100">
                        <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm">
                          <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                        </div>
                        <div>
                          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Phone Number</p>
                          <p className="text-sm font-black text-gray-900">{user.phone}</p>
                        </div>
                      </div>
                    )}
                    {user.address && (
                      <div className="flex items-center gap-3 bg-gray-50 px-5 py-3 rounded-2xl border border-gray-100">
                        <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm">
                          <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                        </div>
                        <div>
                          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Address</p>
                          <p className="text-sm font-black text-gray-900">{user.address}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              <div className="bg-[#059669] rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl shadow-primary-200/50">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
                 <h3 className="font-black text-sm uppercase tracking-widest mb-8 flex items-center gap-3">
                  <svg className="w-5 h-5 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-2.06 3.42 3.42 0 014.438 0c.691.547 1.289 1.251 1.946 2.06 1.452 1.782 3.59 2.319 5.354 1.287a3.42 3.42 0 014.438 4.438c-1.032 1.763-.495 3.902 1.287 5.354a3.42 3.42 0 010 4.438c-1.782 1.452-2.319 3.59-1.287 5.354a3.42 3.42 0 01-4.438 4.438c-1.763-1.032-3.902-.495-5.354 1.287a3.42 3.42 0 01-4.438 0c-1.452-1.782-3.59-2.319-5.354-1.287a3.42 3.42 0 01-4.438-4.438c1.032-1.763.495-3.902-1.287-5.354a3.42 3.42 0 010-4.438c1.782-1.452 3.59-3.59 1.287-5.354a3.42 3.42 0 014.438-4.438c1.763 1.032 3.902.495 5.354-1.287z"/></svg>
                  Achievements
                </h3>
                <div className="space-y-6">
                  <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/10">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>
                    </div>
                    <div>
                      <div className="text-xl font-black">{user.totalDonations || 0}</div>
                      <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Meals Logged</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/10">
                    <div className="w-12 h-12 rounded-xl bg-primary-500/20 text-primary-400 flex items-center justify-center">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                    </div>
                    <div>
                      <div className="text-xl font-black">{user.totalDeliveries || 0}</div>
                      <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Successful Deliveries</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* User Content */}
        <div className="mb-20">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-3">
              <span className="p-2 bg-primary-50 rounded-xl text-primary-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
              </span>
              {user.role === 'donor' ? 'Donation History' : 'Activity Feed'}
            </h2>
          </div>
          {donations.length === 0 ? (
            <div className="bg-white rounded-[2.5rem] p-20 text-center border border-dashed border-gray-200">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              </div>
              <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">No active items found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {donations.map(d => <DonationCard key={d._id} donation={d} />)}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
