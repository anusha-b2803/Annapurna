import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import Navbar from '../components/common/Navbar';
import Spinner from '../components/common/Spinner';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

export default function RequestDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    api.get(`/requests/${id}`)
      .then(res => {
        setRequest(res.data);
      })
      .catch(() => toast.error('Failed to load request'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this request?')) return;
    setActionLoading(true);
    try {
      await api.put(`/requests/${id}/cancel`);
      toast.success('Request cancelled');
      navigate('/requests');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-[#fcfdfd]"><Navbar /><Spinner center /></div>;
  if (!request) return <div className="min-h-screen bg-[#fcfdfd]"><Navbar /><div className="p-20 text-center font-black text-gray-400 uppercase tracking-widest">Request not found</div></div>;

  const isOwner = request.requester?._id === user._id;

  return (
    <div className="min-h-screen bg-[#fcfdfd]">
      <Navbar />
      <main className="max-w-6xl mx-auto px-6 py-12">
        <Link to="/community" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-primary-600 transition-colors mb-10">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7"/></svg>
          Back to Community
        </Link>

        <div className="grid lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-10">
            <div className="bg-white rounded-[3.5rem] p-12 shadow-2xl shadow-gray-100 border border-gray-100">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                      request.urgencyLevel === 'emergency' ? 'bg-red-50 text-red-700 border-red-100 animate-pulse' : 'bg-primary-50 text-primary-700 border-primary-100'
                    }`}>
                      {request.urgencyLevel} Priority
                    </span>
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                      request.status === 'fulfilled' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-gray-50 text-gray-700 border-gray-100'
                    }`}>
                      {request.status}
                    </span>
                  </div>
                  <h1 className="text-4xl font-black text-gray-900 tracking-tight leading-tight">{request.title}</h1>
                </div>
              </div>

              <p className="text-gray-500 text-lg leading-relaxed mb-10">{request.description}</p>

              <div className="grid sm:grid-cols-3 gap-6">
                <div className="bg-gray-50 rounded-[2rem] p-6 border border-gray-100/50">
                  <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Food Type</div>
                  <div className="font-black text-gray-900 text-xl capitalize">{request.foodType}</div>
                </div>
                <div className="bg-gray-50 rounded-[2rem] p-6 border border-gray-100/50">
                  <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Servings Needed</div>
                  <div className="font-black text-gray-900 text-xl">{request.servingsNeeded} People</div>
                </div>
                <div className="bg-gray-50 rounded-[2rem] p-6 border border-gray-100/50">
                  <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Required By</div>
                  <div className="font-black text-gray-900 text-sm leading-tight">{new Date(request.requiredBy).toLocaleString()}</div>
                </div>
              </div>

              {request.dietaryRestrictions?.length > 0 && (
                <div className="mt-10">
                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Dietary Restrictions</h4>
                  <div className="flex flex-wrap gap-2">
                    {request.dietaryRestrictions.map(d => (
                      <span key={d} className="px-4 py-2 bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-widest rounded-xl border border-emerald-100">{d}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white rounded-[3.5rem] p-12 shadow-2xl shadow-gray-100 border border-gray-100">
              <h3 className="text-[10px] font-black text-primary-600 uppercase tracking-widest mb-8">Delivery Address</h3>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center flex-shrink-0 text-gray-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                </div>
                <p className="text-sm text-gray-600 font-bold leading-relaxed">{request.deliveryAddress}</p>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            <div className="bg-white rounded-[3rem] p-10 shadow-2xl shadow-gray-100 border border-gray-100">
              <h3 className="text-[10px] font-black text-primary-600 uppercase tracking-widest mb-8">Requester</h3>
              <div className="flex items-center gap-4 group">
                <div className="w-16 h-16 rounded-[1.5rem] bg-primary-100 flex items-center justify-center shadow-lg shadow-primary-50">
                  <span className="text-xl text-primary-600 font-black uppercase">{request.requester?.name?.[0]}</span>
                </div>
                <div>
                  <div className="font-black text-gray-900 text-lg">{request.requester?.organizationName || request.requester?.name}</div>
                  <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Verified Organization</div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {user.role === 'donor' && request.status === 'open' && (
                <Link to={`/donations/new?requestId=${request._id}`} className="block w-full bg-primary-600 text-white py-6 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] text-center hover:bg-primary-700 transition-all shadow-2xl shadow-primary-200 active:scale-[0.98]">
                  Fulfill Request
                </Link>
              )}
              {isOwner && request.status === 'open' && (
                <button onClick={handleCancel} disabled={actionLoading} className="w-full bg-red-50 text-red-600 py-6 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] hover:bg-red-100 transition-all active:scale-[0.98]">
                  {actionLoading ? '...' : 'Cancel Request'}
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
