import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/common/Navbar';
import Spinner from '../components/common/Spinner';
import api from '../utils/api';
import { toast } from 'react-toastify';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [listData, setListData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [listLoading, setListLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview'); // overview, users, donations, requests

  const fetchStats = async () => {
    try {
      const res = await api.get('/admin/stats');
      setStats(res.data);
    } catch (err) {
      toast.error('Failed to load admin stats');
    }
  };

  const fetchListData = async (tab) => {
    if (tab === 'overview') return;
    setListLoading(true);
    try {
      const res = await api.get(`/admin/${tab}`);
      setListData(res.data[tab] || []);
    } catch (err) {
      toast.error(`Failed to load ${tab}`);
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => {
    fetchStats().finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchListData(activeTab);
  }, [activeTab]);

  const handleVerify = async (userId) => {
    try {
      await api.put(`/admin/users/${userId}/verify`);
      toast.success('User verified');
      fetchListData('users');
      fetchStats();
    } catch {
      toast.error('Verification failed');
    }
  };

  const handleDownloadReports = () => {
    if (!stats) return;
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Metric,Value\n"
      + `Total Users,${stats.users.total}\n`
      + `Donors,${stats.users.donors}\n`
      + `Volunteers,${stats.users.volunteers}\n`
      + `Orphanages,${stats.users.orphanages}\n`
      + `Total Donations,${stats.donations.total}\n`
      + `Active Donations,${stats.donations.active}\n`
      + `Delivered Donations,${stats.donations.delivered}\n`
      + `Total Requests,${stats.requests.total}\n`
      + `Fulfilled Requests,${stats.requests.fulfilled}\n`;
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `annapurna_admin_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Report downloaded successfully");
  };

  if (loading) return <Spinner center />;

  return (
    <div className="min-h-screen bg-[#fcfdfd]">
      <Navbar />
      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1 bg-gray-900 text-white text-[10px] font-black uppercase tracking-widest rounded-lg">Admin Control</span>
            </div>
            <h1 className="text-5xl font-black text-gray-900 tracking-tight leading-tight">Platform Oversight</h1>
            <p className="text-gray-400 font-bold uppercase tracking-[0.2em] text-[10px] mt-2">Manage users, donations, and ecosystem health</p>
          </div>
          <button onClick={handleDownloadReports} className="bg-gray-900 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-primary-600 transition-all shadow-xl active:scale-95 flex items-center gap-3">
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
             Export Metrics
          </button>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {[
            { label: 'Total Community', value: stats.users.total, sub: `${stats.users.recentNew} new this week`, color: 'border-primary-500' },
            { label: 'Live Donations', value: stats.donations.active, sub: `${stats.donations.total} total life-time`, color: 'border-emerald-500' },
            { label: 'NGO Requests', value: stats.requests.open, sub: `${stats.requests.fulfilled} fulfilled`, color: 'border-blue-500' }
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className={`bg-white p-8 rounded-[2.5rem] shadow-2xl shadow-gray-100 border border-gray-100 border-l-[12px] ${s.color}`}>
              <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{s.label}</div>
              <div className="text-4xl font-black text-gray-900 mb-2">{s.value}</div>
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">{s.sub}</div>
            </motion.div>
          ))}
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-[3rem] shadow-2xl shadow-gray-100 border border-gray-100 overflow-hidden">
          <div className="flex flex-wrap border-b border-gray-50 px-8">
            {['overview', 'users', 'donations', 'requests'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative ${
                  activeTab === tab ? 'text-primary-600' : 'text-gray-400 hover:text-gray-900'
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <motion.div layoutId="admin-tab" className="absolute bottom-0 left-8 right-8 h-1.5 bg-primary-600 rounded-t-full" />
                )}
              </button>
            ))}
          </div>

          <div className="p-10">
            {activeTab === 'overview' && (
               <div className="grid lg:grid-cols-2 gap-12">
                  <div className="space-y-8">
                    <h3 className="text-xl font-black text-gray-900">User Distribution</h3>
                    <div className="space-y-6">
                      {[
                        { label: 'Donors', count: stats.users.donors, color: 'bg-emerald-500', total: stats.users.total },
                        { label: 'Volunteers', count: stats.users.volunteers, color: 'bg-primary-500', total: stats.users.total },
                        { label: 'Orphanages', count: stats.users.orphanages, color: 'bg-blue-500', total: stats.users.total },
                      ].map(u => (
                        <div key={u.label}>
                          <div className="flex justify-between items-center mb-3">
                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{u.label}</span>
                            <span className="font-black text-gray-900">{u.count}</span>
                          </div>
                          <div className="h-3 bg-gray-50 rounded-full overflow-hidden border border-gray-100">
                             <motion.div initial={{ width: 0 }} animate={{ width: `${(u.count / (u.total || 1)) * 100}%` }} className={`h-full ${u.color}`} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-[2.5rem] p-10 border border-gray-100">
                     <h3 className="text-xl font-black text-gray-900 mb-6">System Health</h3>
                     <div className="space-y-4">
                        {[
                          { label: 'API Status', val: 'Operational', color: 'text-emerald-500' },
                          { label: 'Database', val: 'Healthy', color: 'text-emerald-500' },
                          { label: 'Real-time Sync', val: 'Active', color: 'text-emerald-500' }
                        ].map(item => (
                          <div key={item.label} className="flex items-center justify-between py-3 border-b border-gray-200/50 last:border-0">
                             <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">{item.label}</span>
                             <span className={`text-xs font-black uppercase tracking-widest ${item.color}`}>{item.val}</span>
                          </div>
                        ))}
                     </div>
                  </div>
               </div>
            )}

            {activeTab !== 'overview' && (
               <div className="overflow-x-auto">
                  {listLoading ? <Spinner center /> : (
                    <table className="w-full text-left border-collapse">
                       <thead>
                          <tr className="border-b border-gray-100">
                             <th className="py-6 px-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Details</th>
                             <th className="py-6 px-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                             {activeTab !== 'users' && <th className="py-6 px-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Actions</th>}
                          </tr>
                       </thead>
                       <tbody>
                          <AnimatePresence>
                             {listData.map((item, idx) => (
                               <motion.tr key={item._id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }} className="border-b border-gray-50 group hover:bg-gray-50/50 transition-colors">
                                  <td className="py-6 px-4">
                                     <div className="font-black text-gray-900">{item.name || item.title}</div>
                                     <div className="text-[10px] font-bold text-gray-400 uppercase mt-1">{item.email || item.foodType}</div>
                                  </td>
                                  <td className="py-6 px-4">
                                     <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                                       (item.isVerified || item.status === 'delivered' || item.status === 'fulfilled') 
                                       ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                                       : 'bg-amber-50 text-amber-700 border-amber-100'
                                     }`}>
                                        {item.role || item.status}
                                     </span>
                                  </td>
                                  {activeTab !== 'users' && (
                                    <td className="py-6 px-4">
                                      {activeTab === 'donations' && (
                                        <Link to={`/donations/${item._id}`} className="text-gray-400 hover:text-gray-900 font-black text-[10px] uppercase tracking-widest transition-colors">View Deep Details</Link>
                                      )}
                                      {activeTab === 'requests' && (
                                        <Link to={`/requests/${item._id}`} className="text-gray-400 hover:text-gray-900 font-black text-[10px] uppercase tracking-widest transition-colors">View Deep Details</Link>
                                      )}
                                    </td>
                                  )}
                               </motion.tr>
                             ))}
                          </AnimatePresence>
                       </tbody>
                    </table>
                  )}
               </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
