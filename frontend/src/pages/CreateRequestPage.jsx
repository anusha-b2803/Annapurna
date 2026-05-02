import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import Navbar from '../components/common/Navbar';
import api from '../utils/api';

export default function CreateRequestPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: '', description: '', foodType: 'any', quantity: '', servingsNeeded: '',
    requiredBy: '', deliveryAddress: '', urgencyLevel: 'medium', beneficiaryCount: '',
    dietaryRestrictions: [],
    location: { type: 'Point', coordinates: [80.2707, 13.0827] },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...form };
      if (!payload.servingsNeeded) delete payload.servingsNeeded;
      else payload.servingsNeeded = parseInt(payload.servingsNeeded);
      
      if (!payload.beneficiaryCount) delete payload.beneficiaryCount;
      else payload.beneficiaryCount = parseInt(payload.beneficiaryCount);

      await api.post('/requests', payload);
      toast.success('Request shared with the community');
      navigate('/requests');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit request');
    } finally { setLoading(false); }
  };

  const getLocation = () => {
    navigator.geolocation.getCurrentPosition(
      pos => { 
        setForm(f => ({ ...f, location: { type: 'Point', coordinates: [pos.coords.longitude, pos.coords.latitude] } })); 
        toast.success('Delivery location verified'); 
      },
      () => toast.error('Could not determine location')
    );
  };

  return (
    <div className="min-h-screen bg-[#fcfdfd]">
      <Navbar />
      <main className="max-w-4xl mx-auto px-6 py-12">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase tracking-widest rounded-full border border-emerald-200">New Request</span>
            </div>
            <h1 className="text-5xl font-black text-gray-900 tracking-tight mb-2">Request Food</h1>
            <p className="text-gray-400 font-bold text-lg uppercase tracking-tight">Let the community know what you need</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-10">
            {/* Request Details */}
            <div className="bg-white rounded-[3rem] p-10 md:p-14 shadow-2xl shadow-gray-100 border border-gray-100 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary-50 rounded-full translate-x-1/2 -translate-y-1/2 opacity-50" />
              <h2 className="text-[10px] font-black text-primary-600 uppercase tracking-[0.2em] mb-10">01 — Need Details</h2>

              <div className="space-y-8">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Request Title</label>
                  <input type="text" className="w-full bg-gray-50 border-transparent rounded-2xl px-6 py-4 text-sm font-bold focus:bg-white focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all outline-none" placeholder="e.g. Daily meals for 50 children" required
                    value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Description</label>
                  <textarea className="w-full bg-gray-50 border-transparent rounded-2xl px-6 py-4 text-sm font-bold focus:bg-white focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all outline-none min-h-[120px] resize-none" placeholder="Describe the specific needs or circumstances..." required
                    value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Food Category</label>
                    <select className="w-full bg-gray-50 border-transparent rounded-2xl px-6 py-4 text-sm font-bold focus:bg-white focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all outline-none appearance-none cursor-pointer" value={form.foodType} onChange={e => setForm({ ...form, foodType: e.target.value })}>
                      {['any', 'cooked', 'raw', 'packaged', 'beverages'].map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Urgency Level</label>
                    <select className="w-full bg-gray-50 border-transparent rounded-2xl px-6 py-4 text-sm font-bold focus:bg-white focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all outline-none appearance-none cursor-pointer" value={form.urgencyLevel} onChange={e => setForm({ ...form, urgencyLevel: e.target.value })}>
                      {['low', 'medium', 'high', 'critical'].map(u => <option key={u} value={u}>{u.charAt(0).toUpperCase() + u.slice(1)}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Quantity Needed</label>
                    <input type="text" className="w-full bg-gray-50 border-transparent rounded-2xl px-6 py-4 text-sm font-bold focus:bg-white focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all outline-none" placeholder="e.g. 20 kg or 50 plates" required
                      value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Required By (Deadline)</label>
                    <input type="datetime-local" className="w-full bg-gray-50 border-transparent rounded-2xl px-6 py-4 text-sm font-bold focus:bg-white focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all outline-none" required
                      value={form.requiredBy} onChange={e => setForm({ ...form, requiredBy: e.target.value })} />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Estimated Servings</label>
                    <input type="number" className="w-full bg-gray-50 border-transparent rounded-2xl px-6 py-4 text-sm font-bold focus:bg-white focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all outline-none" placeholder="Number of people" min="1"
                      value={form.servingsNeeded} onChange={e => setForm({ ...form, servingsNeeded: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Total Beneficiaries</label>
                    <input type="number" className="w-full bg-gray-50 border-transparent rounded-2xl px-6 py-4 text-sm font-bold focus:bg-white focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all outline-none" placeholder="Community size" min="1"
                      value={form.beneficiaryCount} onChange={e => setForm({ ...form, beneficiaryCount: e.target.value })} />
                  </div>
                </div>
                <div className="pt-8 border-t border-gray-50">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Dietary Requirements</label>
                  <div className="flex flex-wrap gap-3">
                    {['Vegetarian', 'Vegan', 'Non-Veg', 'Halal', 'Gluten-Free', 'Jain'].map(opt => (
                      <button key={opt} type="button" onClick={() => setForm(f => ({ ...f, dietaryRestrictions: f.dietaryRestrictions.includes(opt) ? f.dietaryRestrictions.filter(d => d !== opt) : [...f.dietaryRestrictions, opt] }))}
                        className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                          form.dietaryRestrictions.includes(opt) ? 'bg-primary-600 text-white border-primary-600 shadow-lg shadow-primary-100' : 'bg-white text-gray-400 border-gray-100 hover:border-primary-200'
                        }`}>{opt}</button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Delivery Location */}
            <div className="bg-white rounded-[3rem] p-10 md:p-14 shadow-2xl shadow-gray-100 border border-gray-100">
              <h2 className="text-[10px] font-black text-primary-600 uppercase tracking-[0.2em] mb-10">02 — Delivery Location</h2>
              <div className="space-y-8">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Delivery Address</label>
                  <textarea className="w-full bg-gray-50 border-transparent rounded-2xl px-6 py-4 text-sm font-bold focus:bg-white focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all outline-none resize-none" placeholder="Where should the food be delivered?" required rows={3}
                    value={form.deliveryAddress} onChange={e => setForm({ ...form, deliveryAddress: e.target.value })} />
                </div>
                
                <div className="flex flex-col gap-4">
                  <button type="button" onClick={getLocation} className="w-full flex items-center justify-center gap-3 bg-primary-600 text-white py-5 rounded-[1.5rem] font-black text-xs uppercase tracking-widest hover:bg-primary-700 transition-all active:scale-[0.98] shadow-xl shadow-primary-100">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                    Use My Current Location
                  </button>
                </div>
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full bg-primary-600 text-white py-6 rounded-[2rem] font-black text-sm uppercase tracking-[0.3em] hover:bg-primary-700 transition-all active:scale-[0.98] shadow-2xl shadow-primary-200 disabled:opacity-60 flex items-center justify-center gap-4">
              {loading ? (
                <>
                  <div className="w-5 h-5 border-4 border-white border-t-transparent rounded-full animate-spin" />
                  Sharing Request...
                </>
              ) : 'Share Food Request'}
            </button>
          </form>
        </motion.div>
      </main>
    </div>
  );
}
