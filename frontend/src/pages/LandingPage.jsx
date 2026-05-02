import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import api from '../utils/api';

const features = [
  { 
    icon: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>, 
    title: 'Real-Time Geolocation', 
    desc: 'Intelligent proximity matching connects surplus food to the nearest needs using edge computing.' 
  },
  { 
    icon: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>, 
    title: 'Volunteer Logistics', 
    desc: 'Optimized routing for volunteers ensures rapid collection and delivery within freshness windows.' 
  },
  { 
    icon: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>, 
    title: 'Organization Support', 
    desc: 'Dedicated portals for NGOs and orphanages to share their food needs with the community.' 
  },
  { 
    icon: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>, 
    title: 'Impact Network', 
    desc: 'A transparent social layer that visualizes community contributions and celebrates local heroes.' 
  },
];

export default function LandingPage() {
  const [activeContent, setActiveContent] = useState(null);
  const [stats, setStats] = useState([
    { value: '...', label: 'Meals Saved' },
    { value: '...', label: 'Volunteers' },
    { value: '...', label: 'Organizations' },
    { value: '...', label: 'Cities' },
  ]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/public/stats');
        setStats([
          { value: res.data.mealsSaved >= 1000 ? `${(res.data.mealsSaved / 1000).toFixed(1)}K+` : `${res.data.mealsSaved}`, label: 'Meals Saved' },
          { value: `${res.data.volunteers}`, label: 'Volunteers' },
          { value: `${res.data.organizations}`, label: 'Organizations' },
          { value: `${res.data.cities}`, label: 'Cities' },
        ]);
      } catch (err) {
        console.error('Failed to fetch stats', err);
      }
    };
    fetchStats();
  }, []);

  const contentMap = {
    privacy: {
      title: 'Privacy Policy 2026',
      body: 'Your data is protected using advanced security standards. We collect only essential location data during active food distribution missions. All data is managed with transparency and deleted after successful delivery validation. We never sell your personal information to third parties.'
    },
    terms: {
      title: 'Terms of Service',
      body: 'By joining Annapurna, you agree to prioritize the safety and quality of redistributed food. Volunteers and organizations must adhere to modern food safety standards to ensure the well-being of the community.'
    },
    support: {
      title: 'Help & Support',
      body: 'Need assistance? Our support team is here to help 24/7. Reach out via support@annapurna.network or use the help channel within your dashboard. For immediate emergencies, please contact your local area coordinator.'
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-primary-100 selection:text-primary-900">
      {/* Interactive Content Modal */}
      <AnimatePresence>
        {activeContent && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-primary-950/40 backdrop-blur-sm"
            onClick={() => setActiveContent(null)}
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }} 
              animate={{ scale: 1, y: 0 }} 
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white rounded-[2.5rem] p-10 md:p-14 max-w-2xl w-full shadow-2xl border border-gray-100 relative"
              onClick={e => e.stopPropagation()}
            >
              <button 
                onClick={() => setActiveContent(null)}
                className="absolute top-8 right-8 w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-all"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-2 h-2 bg-primary-600 rounded-full animate-ping" />
                <span className="text-[10px] font-black text-primary-600 uppercase tracking-[0.2em]">{contentMap[activeContent].title}</span>
              </div>
              <h2 className="text-4xl font-black text-gray-900 tracking-tight mb-6">{contentMap[activeContent].title}</h2>
              <p className="text-gray-500 font-bold text-lg leading-relaxed italic border-l-4 border-primary-500 pl-8 py-4 bg-gray-50 rounded-r-3xl">
                {contentMap[activeContent].body}
              </p>
              <button 
                onClick={() => setActiveContent(null)}
                className="mt-10 bg-primary-600 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-primary-700 transition-all shadow-xl shadow-primary-200"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-200 group-hover:scale-105 transition-transform">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
            </div>
            <span className="font-extrabold text-2xl tracking-tight text-gray-900">Annapurna</span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-gray-600">
            <a href="#features" className="hover:text-primary-600 transition-colors">Features</a>
            <a href="#impact" className="hover:text-primary-600 transition-colors">Impact</a>
            <div className="h-4 w-px bg-gray-200" />
            <Link to="/login" className="hover:text-primary-600 transition-colors">Sign In</Link>
            <Link to="/register" className="bg-primary-600 text-white px-6 py-2.5 rounded-full hover:bg-primary-700 transition-all shadow-md hover:shadow-lg active:scale-95">Get Started</Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-40 pb-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-50 text-primary-700 text-xs font-bold uppercase tracking-widest mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500"></span>
              </span>
              Community Impact 2026
            </div>
            <h1 className="text-6xl lg:text-7xl font-black text-gray-900 leading-[1.1] mb-8">
              Share Food,<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-emerald-500">Spread Hope.</span>
            </h1>
            <p className="text-xl text-gray-500 leading-relaxed mb-10 max-w-lg">
              The professional platform connecting surplus food to those who need it most. Join our global community today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/register" className="bg-primary-600 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-primary-700 transition-all shadow-xl shadow-primary-200 hover:-translate-y-1">Start Donating</Link>
              <Link to="/register" className="bg-white text-gray-900 border-2 border-gray-100 px-8 py-4 rounded-2xl font-bold text-lg hover:border-primary-200 transition-all hover:bg-gray-50">Volunteer Now</Link>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9, rotate: 2 }} 
            animate={{ opacity: 1, scale: 1, rotate: 0 }} 
            transition={{ duration: 1 }}
            className="relative"
          >
            <div className="absolute -inset-4 bg-gradient-to-tr from-primary-100 to-emerald-50 rounded-[3rem] blur-2xl opacity-50 -z-10" />
            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-2xl p-8 relative overflow-hidden">
              <div className="grid grid-cols-1 gap-6">
                {[
                  { name: 'Food Distribution', status: 'In Transit', color: 'bg-emerald-500' },
                  { name: 'Donation Pickup', status: 'Ready', color: 'bg-primary-500' },
                  { name: 'Community Sharing', status: 'Pending', color: 'bg-teal-400' }
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100">
                    <div className={`w-12 h-12 rounded-xl ${item.color} flex items-center justify-center text-white`}>
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-bold text-gray-900">{item.name}</div>
                      <div className="text-xs text-gray-500">Live Status: {item.status}</div>
                    </div>
                    <div className="text-xs font-bold text-primary-600 bg-primary-50 px-3 py-1 rounded-full">Active</div>
                  </div>
                ))}
              </div>
              <div className="mt-8 pt-8 border-t border-gray-100 flex items-center justify-between">
                <div className="flex -space-x-3">
                  {[1,2,3,4].map(i => <div key={i} className="w-10 h-10 rounded-full border-4 border-white bg-gray-200" />)}
                </div>
                <div className="text-sm font-bold text-gray-500">{stats[1].value} Volunteers Active</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Bar */}
      <section id="impact" className="py-24 bg-[#064e3b] overflow-hidden relative shadow-[inset_0_0_100px_rgba(0,0,0,0.2)]">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-400/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-400/20 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2" />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 text-center">
            {stats.map((s, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 20 }} 
                whileInView={{ opacity: 1, y: 0 }} 
                viewport={{ once: true }}
              >
                <div className="text-5xl md:text-6xl font-black text-white mb-3 tracking-tighter drop-shadow-lg">{s.value}</div>
                <div className="text-primary-300 font-black tracking-[0.2em] text-[10px] uppercase">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-black text-gray-900 mb-4">Built for Real Change</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">Our platform uses smart technology to make food redistribution simple, fast, and effective.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="group p-8 rounded-[2rem] bg-gray-50 border border-transparent hover:border-primary-100 hover:bg-white hover:shadow-xl transition-all duration-300"
              >
                <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center text-primary-600 group-hover:bg-primary-600 group-hover:text-white transition-all duration-300 mb-8">
                  {f.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="pb-32 px-6">
        <div className="bg-[#059669] rounded-[2.5rem] p-16 text-center relative overflow-hidden shadow-2xl shadow-primary-200/50">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6">Ready to make an impact?</h2>
            <p className="text-primary-100 mb-10 text-lg max-w-xl mx-auto">Join the largest food security network. Sign up as a donor or volunteer today.</p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link to="/register" className="bg-white text-primary-600 px-10 py-4 rounded-2xl font-black text-lg hover:bg-gray-50 transition-all active:scale-95 shadow-xl">Join the Community</Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="py-12 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
            </div>
            <span className="font-bold text-xl tracking-tight text-gray-900">Annapurna</span>
          </div>
          <div className="text-sm font-medium text-gray-400">
            © 2026 Annapurna. Ending hunger together.
          </div>
          <div className="flex gap-6 text-sm font-bold text-gray-400">
            <button onClick={() => setActiveContent('privacy')} className="hover:text-primary-600 transition-colors uppercase tracking-widest text-[10px]">Privacy</button>
            <button onClick={() => setActiveContent('terms')} className="hover:text-primary-600 transition-colors uppercase tracking-widest text-[10px]">Terms</button>
            <button onClick={() => setActiveContent('support')} className="hover:text-primary-600 transition-colors uppercase tracking-widest text-[10px]">Support</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
