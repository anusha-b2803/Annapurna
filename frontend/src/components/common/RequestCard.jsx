import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function RequestCard({ request }) {
  const urgencyColors = {
    low: 'bg-blue-100 text-blue-700 border-blue-200',
    medium: 'bg-amber-100 text-amber-700 border-amber-200',
    high: 'bg-orange-100 text-orange-700 border-orange-200',
    emergency: 'bg-red-100 text-red-700 border-red-200 animate-pulse'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden group hover:shadow-2xl hover:shadow-gray-200 transition-all duration-500"
    >
      <div className="p-8">
        <div className="flex justify-between items-start mb-6">
          <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${urgencyColors[request.urgencyLevel || 'medium']}`}>
            {request.urgencyLevel || 'Standard'} Request
          </span>
          <div className="flex -space-x-3">
             <div className="w-10 h-10 rounded-xl bg-primary-50 border-4 border-white flex items-center justify-center font-black text-primary-600 text-xs">
                {request.requester?.name?.[0] || 'O'}
             </div>
          </div>
        </div>

        <h3 className="text-2xl font-black text-gray-900 mb-2 leading-tight group-hover:text-primary-600 transition-colors">
          {request.title}
        </h3>
        
        <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mb-6 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
          {request.requester?.organizationName || 'Verified Organization'}
        </p>

        <div className="bg-gray-50 rounded-3xl p-6 mb-8 border border-gray-100 italic text-gray-500 font-medium text-sm">
          "{request.description?.slice(0, 100)}..."
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-primary-50/50 p-4 rounded-2xl border border-primary-100/50 text-center">
            <p className="text-[9px] font-black text-primary-600 uppercase tracking-widest mb-1">Servings Needed</p>
            <p className="text-xl font-black text-gray-900">{request.servingsNeeded}</p>
          </div>
          <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100/50 text-center">
            <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mb-1">Food Type</p>
            <p className="text-xl font-black text-gray-900 capitalize">{request.foodType}</p>
          </div>
        </div>

        <Link 
          to={`/requests/${request._id}`}
          className="block w-full py-4 bg-gray-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] text-center hover:bg-primary-600 transition-all shadow-xl shadow-gray-200 active:scale-95"
        >
          View Details
        </Link>
      </div>
    </motion.div>
  );
}
