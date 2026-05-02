import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Navbar from '../components/common/Navbar';
import Spinner from '../components/common/Spinner';
import api from '../utils/api';
import { toast } from 'react-toastify';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const res = await api.get('/admin/stats');
        setStats(res.data);
      } catch (err) {
        toast.error('Failed to load admin stats');
      } finally {
        setLoading(false);
      }
    };
    fetchAdminData();
  }, []);

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

  const handleSettingsClick = () => {
    toast.info("Platform settings module will be available in v2.0");
  };

  if (loading) return <Spinner center />;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Admin Dashboard</h1>
            <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px] mt-1">Platform-wide management and oversight</p>
          </div>
          <div className="flex gap-2">
            <button onClick={handleDownloadReports} className="btn-secondary py-2 px-4 text-sm">Download Reports</button>
            <button onClick={handleSettingsClick} className="btn-primary py-2 px-4 text-sm">Platform Settings</button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card p-6 border-l-4 border-primary-500">
            <div className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Total Users</div>
            <div className="text-4xl font-black text-gray-900">{stats.users.total}</div>
            <div className="mt-4 flex items-center gap-2 text-xs">
              <span className="text-green-500 font-bold">+{stats.users.recentNew}</span>
              <span className="text-gray-400">new this week</span>
            </div>
          </motion.div>
          
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 border-l-4 border-teal-500">
            <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Active Donations</div>
            <div className="text-4xl font-black text-gray-900">{stats.donations.active}</div>
            <div className="mt-4 flex items-center gap-2 text-xs font-bold">
              <span className="text-teal-500">{stats.donations.total}</span>
              <span className="text-gray-400 uppercase tracking-widest text-[9px]">total lifetime</span>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 border-l-4 border-emerald-500">
            <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Fulfilled Requests</div>
            <div className="text-4xl font-black text-gray-900">{stats.requests.fulfilled}</div>
            <div className="mt-4 flex items-center gap-2 text-xs font-bold">
              <span className="text-emerald-500">{((stats.requests.fulfilled / stats.requests.total) * 100).toFixed(1)}%</span>
              <span className="text-gray-400 uppercase tracking-widest text-[9px]">fulfillment rate</span>
            </div>
          </motion.div>
        </div>

        {/* Management Tabs */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex border-b border-gray-100 px-6">
            {['overview', 'users', 'donations', 'logs'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-4 text-sm font-bold capitalize transition-all relative ${
                  activeTab === tab ? 'text-primary-500' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-1 bg-primary-500 rounded-t-full" />
                )}
              </button>
            ))}
          </div>
          
          <div className="p-8">
            {activeTab === 'overview' && (
              <div className="grid md:grid-cols-2 gap-10">
                <div>
                  <h3 className="font-black text-gray-900 mb-6 flex items-center gap-3">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
                    </div>
                    User Distribution
                  </h3>
                  <div className="space-y-4">
                    {[
                      { role: 'Donors', count: stats.users.donors, color: 'bg-emerald-500' },
                      { role: 'Volunteers', count: stats.users.volunteers, color: 'bg-teal-500' },
                      { role: 'Orphanages', count: stats.users.orphanages, color: 'bg-blue-500' },
                    ].map(u => (
                      <div key={u.role}>
                        <div className="flex justify-between text-sm mb-1.5">
                          <span className="font-medium text-gray-600">{u.role}</span>
                          <span className="font-bold text-gray-900">{u.count}</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${u.color}`} 
                            style={{ width: `${(u.count / stats.users.total) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="font-black text-gray-900 mb-6 flex items-center gap-3">
                    <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                    </div>
                    Recent Activity
                  </h3>
                  <div className="space-y-4">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="flex gap-3 text-sm">
                        <div className="w-2 h-2 mt-1.5 rounded-full bg-gray-300" />
                        <div>
                          <p className="text-gray-700 font-medium">New donation verified in Mumbai Central</p>
                          <p className="text-xs text-gray-400 mt-0.5">2 minutes ago</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            {activeTab !== 'overview' && (
              <div className="py-20 text-center text-gray-400 italic">
                {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} management module loading...
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
