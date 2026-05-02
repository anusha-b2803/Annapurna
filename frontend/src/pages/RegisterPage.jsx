import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

const roles = [
  { 
    value: 'donor', 
    label: 'Food Donor', 
    icon: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>, 
    desc: 'Contribute surplus resources to the network.' 
  },
  { 
    value: 'volunteer', 
    label: 'Logistics Partner', 
    icon: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>, 
    desc: 'Manage distribution and last-mile delivery.' 
  },
  { 
    value: 'orphanage', 
    label: 'Recipient Organization', 
    icon: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>, 
    desc: 'Submit nutrition requests for beneficiaries.' 
  },
];

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: '', phone: '', address: '', organizationName: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await register(form);
      toast.success(`Welcome, ${user.name}! Your account is ready.`);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfdfd] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary-100/50 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-emerald-100/50 rounded-full blur-3xl" />
      </div>

      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: 'easeOut' }} className="w-full max-w-lg">
        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-emerald-100/40 p-8 md:p-10 border border-gray-100 relative overflow-hidden">
          <div className="absolute top-0 left-0 p-8">
            <Link to="/" className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-primary-600 transition-all flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
              Home
            </Link>
          </div>
          
          <div className="text-center mb-10">
            <Link to="/" className="inline-flex items-center gap-3 group mb-6">
              <div className="w-12 h-12 bg-primary-600 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-200 group-hover:scale-105 transition-transform">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
              </div>
              <span className="font-black text-2xl tracking-tight text-gray-900">Annapurna</span>
            </Link>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Join Our Community</h1>
            <p className="text-gray-400 font-bold mt-2 uppercase tracking-[0.2em] text-[9px]">Step {step} of 2 — Create your account</p>
          </div>

          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                <p className="text-sm font-black text-gray-900 uppercase tracking-widest mb-6 text-center">Select your Role</p>
                <div className="grid gap-4">
                  {roles.map(r => (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() => { setForm({ ...form, role: r.value }); setStep(2); }}
                      className={`group flex items-center gap-6 p-6 rounded-3xl border-2 transition-all text-left ${
                        form.role === r.value ? 'border-primary-500 bg-primary-50/50 shadow-lg shadow-primary-50' : 'border-gray-50 hover:border-primary-200 hover:bg-gray-50'
                      }`}
                    >
                      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-colors ${form.role === r.value ? 'bg-primary-600 text-white' : 'bg-white border border-gray-100 text-gray-400 group-hover:text-primary-500'}`}>
                        {r.icon}
                      </div>
                      <div>
                        <div className="font-black text-gray-900 text-lg">{r.label}</div>
                        <div className="text-sm text-gray-400 font-bold">{r.desc}</div>
                      </div>
                      <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                        <svg className="w-6 h-6 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7"/></svg>
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.form key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} onSubmit={handleSubmit} className="space-y-6">
                <div className="flex items-center gap-4 mb-8 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <button type="button" onClick={() => setStep(1)} className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-gray-400 hover:text-primary-600 hover:shadow-md transition-all">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7"/></svg>
                  </button>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Configuration for</p>
                    <p className="text-sm font-black text-gray-900 leading-none">{roles.find(r => r.value === form.role)?.label}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Full Name</label>
                    <input type="text" className="w-full px-6 py-4 rounded-2xl bg-gray-50 border border-transparent focus:bg-white focus:border-primary-500 transition-all outline-none font-bold text-gray-900" placeholder="Enter your name" value={form.name}
                      onChange={e => setForm({ ...form, name: e.target.value })} required />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Email Address</label>
                    <input type="email" className="w-full px-6 py-4 rounded-2xl bg-gray-50 border border-transparent focus:bg-white focus:border-primary-500 transition-all outline-none font-bold text-gray-900" placeholder="your@email.com" value={form.email}
                      onChange={e => setForm({ ...form, email: e.target.value })} required />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Password</label>
                    <input type="password" className="w-full px-6 py-4 rounded-2xl bg-gray-50 border border-transparent focus:bg-white focus:border-primary-500 transition-all outline-none font-bold text-gray-900" placeholder="Min 8 characters" value={form.password}
                      onChange={e => setForm({ ...form, password: e.target.value })} required minLength={8} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Phone Number</label>
                    <input type="tel" className="w-full px-6 py-4 rounded-2xl bg-gray-50 border border-transparent focus:bg-white focus:border-primary-500 transition-all outline-none font-bold text-gray-900" placeholder="+91 XXXX XXXX" value={form.phone}
                      onChange={e => setForm({ ...form, phone: e.target.value })} />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">City</label>
                    <input type="text" className="w-full px-6 py-4 rounded-2xl bg-gray-50 border border-transparent focus:bg-white focus:border-primary-500 transition-all outline-none font-bold text-gray-900" placeholder="Mumbai, IN" value={form.address}
                      onChange={e => setForm({ ...form, address: e.target.value })} />
                  </div>
                  {form.role === 'orphanage' && (
                    <div className="md:col-span-2">
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Organization Name</label>
                      <input type="text" className="w-full px-6 py-4 rounded-2xl bg-gray-50 border border-transparent focus:bg-white focus:border-primary-500 transition-all outline-none font-bold text-gray-900" placeholder="Full organization legal name" value={form.organizationName}
                        onChange={e => setForm({ ...form, organizationName: e.target.value })} required />
                    </div>
                  )}
                </div>

                <button type="submit" disabled={loading} className="w-full bg-primary-600 text-white py-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-primary-700 transition-all shadow-xl shadow-primary-200 active:scale-[0.98] disabled:opacity-50">
                  {loading ? 'Creating Account...' : 'Create Account'}
                </button>
              </motion.form>
            )}
          </AnimatePresence>

          <div className="mt-12 pt-10 border-t border-gray-50 text-center">
            <p className="text-gray-400 font-bold text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-primary-600 font-black hover:underline ml-1">Sign In</Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
