import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const statusColors = {
  available: 'bg-emerald-100 text-emerald-700',
  accepted: 'bg-blue-100 text-blue-700',
  picked_up: 'bg-teal-100 text-teal-700',
  delivered: 'bg-slate-100 text-slate-600',
  expired: 'bg-red-100 text-red-700',
  cancelled: 'bg-slate-100 text-slate-500',
};

const foodTypeIcons = {
  cooked: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>,
  raw: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 01-6.001 0M18 7l-3 9m3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"/></svg>,
  packaged: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>,
  beverages: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-3.682A9.98 9.98 0 003 12h18a9.98 9.98 0 00-2.807-6.889m-3.44 3.682A9.98 9.98 0 0112 11z"/></svg>,
  other: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"/></svg>,
};

export default function DonationCard({ donation }) {
  const isExpiringSoon = new Date(donation.expiryTime) - new Date() < 2 * 60 * 60 * 1000;

  return (
    <motion.div whileHover={{ y: -8 }} transition={{ type: 'spring', stiffness: 300 }}>
      <Link to={`/donations/${donation._id}`} className="block">
        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-2xl hover:shadow-emerald-100/50 transition-all duration-300 overflow-hidden group">
          {/* Image or placeholder */}
          <div className="relative h-48 bg-gradient-to-br from-emerald-50 to-teal-50 overflow-hidden">
            {donation.images?.[0] ? (
              <img src={donation.images[0]} alt={donation.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-emerald-400">
                {foodTypeIcons[donation.foodType] || foodTypeIcons.other}
              </div>
            )}
            <div className="absolute top-4 right-4">
              <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${statusColors[donation.status]}`}>{donation.status.replace('_', ' ')}</span>
            </div>
            {donation.isUrgent && (
              <div className="absolute top-4 left-4">
                <span className="flex items-center gap-2 bg-red-600 text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg shadow-red-200">
                  <span className="w-2 h-2 bg-white rounded-full animate-ping" />
                  Urgent
                </span>
              </div>
            )}
          </div>

          <div className="p-6">
            <h3 className="text-lg font-black text-gray-900 truncate group-hover:text-primary-600 transition-colors">{donation.title}</h3>
            <p className="text-sm text-gray-500 mt-2 line-clamp-2 font-medium leading-relaxed">{donation.description}</p>

            <div className="mt-6 flex items-center gap-4">
              <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
                <span className="text-[10px] font-black text-gray-600 uppercase tracking-wider">{donation.servings} Servings</span>
              </div>
              <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 01-6.001 0M18 7l-3 9m3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"/></svg>
                <span className="text-[10px] font-black text-gray-600 uppercase tracking-wider">{donation.quantity}</span>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center border border-primary-100">
                  <span className="text-[10px] font-black">{donation.donor?.name?.[0]}</span>
                </div>
                <span className="text-xs font-bold text-gray-900">{donation.donor?.name}</span>
              </div>
              <div className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest ${isExpiringSoon ? 'text-red-500' : 'text-gray-400'}`}>
                {isExpiringSoon ? (
                  <><span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" /> Expiring Soon</>
                ) : (
                  `Valid till ${new Date(donation.expiryTime).toLocaleDateString()}`
                )}
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
