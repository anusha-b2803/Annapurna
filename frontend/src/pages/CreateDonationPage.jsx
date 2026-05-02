import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import Navbar from '../components/common/Navbar';
import api from '../utils/api';

export default function CreateDonationPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const query = new URLSearchParams(window.location.search);
  const [form, setForm] = useState({
    title: query.get('title') ? `Fulfillment for: ${query.get('title')}` : '', 
    description: '', 
    foodType: 'cooked', 
    quantity: '', 
    servings: '',
    expiryTime: '', 
    pickupAddress: '', 
    isUrgent: false, 
    dietaryInfo: [],
    images: [],
    recipient: query.get('recipient') || null,
    requestId: query.get('requestId') || null,
    location: { type: 'Point', coordinates: [80.2707, 13.0827] },
  });

  const dietaryOptions = ['Vegetarian', 'Vegan', 'Non-Veg', 'Halal', 'Gluten-Free', 'Jain'];

  const toggleDietary = (opt) => {
    setForm(f => ({
      ...f,
      dietaryInfo: f.dietaryInfo.includes(opt) ? f.dietaryInfo.filter(d => d !== opt) : [...f.dietaryInfo, opt]
    }));
  };

  const getLocation = () => {
    navigator.geolocation.getCurrentPosition(
      pos => {
        setForm(f => ({ ...f, location: { type: 'Point', coordinates: [pos.coords.longitude, pos.coords.latitude] } }));
        toast.success('Location updated successfully');
      },
      () => toast.error('Failed to get location')
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...form, servings: form.servings ? parseInt(form.servings) : undefined };
      // Strip null/empty optional fields so they don't fail validation
      if (!payload.recipient) delete payload.recipient;
      if (!payload.requestId) delete payload.requestId;
      const res = await api.post('/donations', payload);
      toast.success('Donation posted successfully! 🎉');
      navigate(`/donations/${res.data._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to post donation');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#fcfdfd]">
      <Navbar />
      <main className="max-w-4xl mx-auto px-6 py-12">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase tracking-widest rounded-full border border-emerald-200">New Donation</span>
            </div>
            <h1 className="text-5xl font-black text-gray-900 tracking-tight mb-2">Share Food</h1>
            <p className="text-gray-400 font-bold text-lg uppercase tracking-tight">Help us provide for the community</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-10">
            {/* Food Details */}
            <div className="bg-white rounded-[3rem] p-10 md:p-14 shadow-2xl shadow-gray-100 border border-gray-100 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary-50 rounded-full translate-x-1/2 -translate-y-1/2 opacity-50" />
              <h2 className="text-[10px] font-black text-primary-600 uppercase tracking-[0.2em] mb-10">01 — Food Details</h2>

              <div className="space-y-8">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Donation Title</label>
                  <input type="text" className="w-full bg-gray-50 border-transparent rounded-2xl px-6 py-4 text-sm font-bold focus:bg-white focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all outline-none" placeholder="e.g. Fresh Meals from Local Event" required
                    value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Food Description</label>
                  <textarea className="w-full bg-gray-50 border-transparent rounded-2xl px-6 py-4 text-sm font-bold focus:bg-white focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all outline-none min-h-[120px] resize-none" placeholder="What kind of food are you sharing? Please include handling notes..." required
                    value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Food Category</label>
                    <select className="w-full bg-gray-50 border-transparent rounded-2xl px-6 py-4 text-sm font-bold focus:bg-white focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all outline-none appearance-none cursor-pointer" value={form.foodType} onChange={e => setForm({ ...form, foodType: e.target.value })}>
                      {['cooked', 'raw', 'packaged', 'beverages', 'other'].map(t => (
                        <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)} Food</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Quantity</label>
                    <input type="text" className="w-full bg-gray-50 border-transparent rounded-2xl px-6 py-4 text-sm font-bold focus:bg-white focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all outline-none" placeholder="e.g. 50 Servings / 15kg" required
                      value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Servings</label>
                    <input type="number" className="w-full bg-gray-50 border-transparent rounded-2xl px-6 py-4 text-sm font-bold focus:bg-white focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all outline-none" placeholder="Number of people" min="1"
                      value={form.servings} onChange={e => setForm({ ...form, servings: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Expiry Time</label>
                    <input type="datetime-local" className="w-full bg-gray-50 border-transparent rounded-2xl px-6 py-4 text-sm font-bold focus:bg-white focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all outline-none" required
                      value={form.expiryTime} onChange={e => setForm({ ...form, expiryTime: e.target.value })} />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Dietary Info</label>
                  <div className="flex flex-wrap gap-3">
                    {dietaryOptions.map(opt => (
                      <button key={opt} type="button" onClick={() => toggleDietary(opt)}
                        className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                          form.dietaryInfo.includes(opt) ? 'bg-primary-600 text-white border-primary-600 shadow-lg shadow-primary-100' : 'bg-white text-gray-400 border-gray-100 hover:border-primary-200'
                        }`}>{opt}</button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Food Photos</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {form.images.map((img, idx) => (
                      <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden group shadow-lg">
                        <img src={img} alt="" className="w-full h-full object-cover" />
                        <button type="button" onClick={() => setForm(f => ({ ...f, images: f.images.filter((_, i) => i !== idx) }))} className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"/></svg>
                        </button>
                      </div>
                    ))}
                    <label className="aspect-square rounded-2xl border-2 border-dashed border-gray-200 hover:border-primary-500 hover:bg-primary-50 transition-all cursor-pointer flex flex-col items-center justify-center gap-2 group">
                      <input type="file" className="sr-only" accept="image/*" onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => setForm(f => ({ ...f, images: [...f.images, reader.result] }));
                          reader.readAsDataURL(file);
                        }
                      }} />
                      <div className="w-10 h-10 rounded-xl bg-gray-50 group-hover:bg-primary-100 flex items-center justify-center text-gray-400 group-hover:text-primary-600 transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"/></svg>
                      </div>
                      <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest group-hover:text-primary-600">Add Photo</span>
                    </label>
                  </div>
                </div>

                <div className="pt-6">
                  <label className="group flex items-center gap-4 cursor-pointer">
                    <div className="relative">
                      <input type="checkbox" className="sr-only" checked={form.isUrgent} onChange={e => setForm({ ...form, isUrgent: e.target.checked })} />
                      <div className={`w-14 h-8 rounded-full transition-colors ${form.isUrgent ? 'bg-primary-600' : 'bg-gray-200'}`} />
                      <div className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${form.isUrgent ? 'translate-x-6' : ''}`} />
                    </div>
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Mark as Urgent</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Pickup Location */}
            <div className="bg-white rounded-[3rem] p-10 md:p-14 shadow-2xl shadow-gray-100 border border-gray-100">
              <h2 className="text-[10px] font-black text-primary-600 uppercase tracking-[0.2em] mb-10">02 — Pickup Details</h2>
              
              <div className="space-y-8">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Pickup Address</label>
                  <textarea className="w-full bg-gray-50 border-transparent rounded-2xl px-6 py-4 text-sm font-bold focus:bg-white focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all outline-none resize-none" placeholder="Where should the volunteer collect the food?" required rows={3}
                    value={form.pickupAddress} onChange={e => setForm({ ...form, pickupAddress: e.target.value })} />
                </div>

                <div className="flex flex-col gap-4">
                  <button type="button" onClick={getLocation} className="w-full flex items-center justify-center gap-3 bg-primary-600 text-white py-5 rounded-[1.5rem] font-black text-xs uppercase tracking-widest hover:bg-primary-700 transition-all active:scale-[0.98] shadow-xl shadow-primary-100">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                    Use My Current Location
                  </button>
                  
                  <AnimatePresence>
                    {form.location.coordinates[0] !== 80.2707 && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 px-6 py-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                        <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/></svg>
                        <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Location Verified: [{form.location.coordinates[1].toFixed(6)}, {form.location.coordinates[0].toFixed(6)}]</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full bg-primary-600 text-white py-6 rounded-[2rem] font-black text-sm uppercase tracking-[0.3em] hover:bg-primary-700 transition-all active:scale-[0.98] shadow-2xl shadow-primary-200 disabled:opacity-60 flex items-center justify-center gap-4">
              {loading ? (
                <>
                  <div className="w-5 h-5 border-4 border-white border-t-transparent rounded-full animate-spin" />
                  Posting Donation...
                </>
              ) : 'Post Donation'}
            </button>
          </form>
        </motion.div>
      </main>
    </div>
  );
}
