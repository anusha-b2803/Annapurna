import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="w-24 h-24 bg-primary-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 text-primary-600 shadow-xl shadow-primary-50">
          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
        </div>
        <h1 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">Oops! This path is closed.</h1>
        <p className="text-gray-400 font-bold uppercase tracking-widest text-xs max-w-md mx-auto mb-10">
          The resource you are looking for doesn't exist or has been relocated.
        </p>
        <Link to="/" className="inline-block bg-primary-600 text-white px-10 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-primary-700 transition-all shadow-xl active:scale-95">
          Return to Home
        </Link>
      </motion.div>
      
      <div className="mt-20 flex gap-4 text-sm text-gray-400">
        <Link to="/donations" className="hover:text-primary-500">Donations</Link>
        <span>•</span>
        <Link to="/map" className="hover:text-primary-500">Live Map</Link>
        <span>•</span>
        <Link to="/community" className="hover:text-primary-500">Community</Link>
      </div>
    </div>
  );
}
