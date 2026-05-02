import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import Navbar from '../components/common/Navbar';
import api from '../utils/api';

// Fix Leaflet default icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const createColorIcon = (color, pulse = false) => L.divIcon({
  html: `
    <div class="relative flex items-center justify-center">
      ${pulse ? `<div class="absolute w-8 h-8 rounded-full animate-ping opacity-40" style="background:${color}"></div>` : ''}
      <div style="width:20px;height:20px;background:${color};border-radius:50%;border:3px solid white;box-shadow:0 4px 12px rgba(0,0,0,0.2); position:relative; z-index:10"></div>
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  className: '',
});

const ICONS = {
  available: createColorIcon('#059669', true), // emerald-600 with pulse
  accepted: createColorIcon('#0d9488'), // teal-600
  picked_up: createColorIcon('#10b981'), // emerald-500
  delivered: createColorIcon('#94a3b8'), // slate-400
  request: createColorIcon('#ef4444', true), // red-500 with pulse
};

export default function MapPage() {
  const [donations, setDonations] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userPos, setUserPos] = useState([13.0827, 80.2707]); // Chennai default
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      pos => setUserPos([pos.coords.latitude, pos.coords.longitude]),
      () => {}
    );

    Promise.all([
      api.get('/donations?limit=100&status=available'),
      api.get('/requests?limit=50'),
    ]).then(([donRes, reqRes]) => {
      setDonations(donRes.data.donations || []);
      setRequests(reqRes.data.requests || []);
    }).catch(() => toast.error('Failed to load map data'))
      .finally(() => setLoading(false));
  }, []);

  const visibleDonations = filter === 'requests' ? [] : donations.filter(d => d.location?.coordinates?.length === 2);
  const visibleRequests = filter === 'donations' ? [] : requests.filter(r => r.location?.coordinates?.length === 2);

  return (
    <div className="min-h-screen bg-[#fcfdfd] flex flex-col">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-[22rem] bg-white shadow-2xl z-10 flex flex-col relative">
          <div className="p-8 border-b border-gray-50">
            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1 bg-primary-100 text-primary-700 text-[10px] font-black uppercase tracking-widest rounded-full">Live Map</span>
            </div>
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">Impact Locations</h2>
            <div className="flex bg-gray-50 p-1 rounded-xl mt-6 border border-gray-100">
              {['all', 'donations', 'requests'].map(f => (
                <button key={f} onClick={() => setFilter(f)}
                  className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${filter === f ? 'bg-primary-600 text-white shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}>
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {/* Legend */}
            <div className="p-8 border-b border-gray-50 bg-gray-50/30">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Map Legend</p>
              <div className="grid grid-cols-2 gap-4 text-[10px] font-black uppercase tracking-widest">
                <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#059669]" /> Available</div>
                <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#0d9488]" /> In-Transit</div>
                <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#ef4444]" /> Critical Request</div>
              </div>
            </div>

            <div className="p-8 space-y-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Donations Nearby</p>
                <span className="px-2 py-0.5 bg-gray-100 rounded text-[9px] font-black text-gray-500">{visibleDonations.length}</span>
              </div>
              <div className="space-y-3">
                {visibleDonations.slice(0, 15).map(d => (
                  <Link key={d._id} to={`/donations/${d._id}`} className="group block p-4 bg-white rounded-2xl border border-gray-100 hover:border-primary-200 hover:shadow-xl hover:shadow-primary-50 transition-all">
                    <div className="font-black text-sm text-gray-900 truncate group-hover:text-primary-600">{d.title}</div>
                    <div className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-widest">{d.donor?.name} · {d.quantity}</div>
                  </Link>
                ))}
              </div>

              {visibleRequests.length > 0 && (
                <div className="mt-10">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-[10px] font-black text-red-400 uppercase tracking-widest">Priority Requests</p>
                    <span className="px-2 py-0.5 bg-red-50 rounded text-[9px] font-black text-red-500">{visibleRequests.length}</span>
                  </div>
                  <div className="space-y-3">
                    {visibleRequests.slice(0, 8).map(r => (
                      <div key={r._id} className="p-4 bg-red-50/50 rounded-2xl border border-red-100">
                        <div className="font-black text-sm text-gray-900 truncate">{r.title}</div>
                        <div className="text-[10px] font-bold text-red-400 mt-1 uppercase tracking-widest">{r.requester?.organizationName} · {r.urgencyLevel}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Map */}
        <div className="flex-1 relative">
          {loading ? (
            <div className="flex items-center justify-center h-full bg-gray-50">
              <div className="flex flex-col items-center gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent shadow-lg" />
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest animate-pulse">Loading Map Data...</p>
              </div>
            </div>
          ) : (
            <MapContainer center={userPos} zoom={13} style={{ height: '100%', width: '100%' }} className="grayscale-[0.1] contrast-[1.05]">
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {/* User position */}
              <Circle center={userPos} radius={300} color="#059669" fillColor="#059669" fillOpacity={0.1} />
              <Marker position={userPos} icon={createColorIcon('#059669')}>
                <Popup>
                  <div className="p-2 font-black text-[10px] uppercase tracking-widest text-emerald-600">Your Location</div>
                </Popup>
              </Marker>              {/* Donations */}
              {visibleDonations.map(d => {
                const [lng, lat] = d.location.coordinates;
                if (!lat || !lng) return null;
                return (
                  <Marker key={d._id} position={[lat, lng]} icon={ICONS[d.status] || ICONS.available}>
                    <Popup className="premium-popup">
                      <div className="p-4 min-w-[200px]">
                        <span className="text-[9px] font-black uppercase tracking-widest text-primary-600 block mb-1">Available Donation</span>
                        <strong className="text-base font-black text-gray-900 block leading-tight">{d.title}</strong>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{d.quantity}</span>
                          <span className="w-1 h-1 bg-gray-200 rounded-full" />
                          <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">{d.foodType}</span>
                        </div>
                        <Link to={`/donations/${d._id}`} className="block w-full text-center bg-primary-600 text-white px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest mt-4 hover:bg-primary-700 transition-all shadow-lg shadow-primary-100">View Details</Link>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}

              {/* Requests */}
              {visibleRequests.map(r => {
                const [lng, lat] = r.location.coordinates;
                if (!lat || !lng) return null;
                return (
                  <Marker key={r._id} position={[lat, lng]} icon={ICONS.request}>
                    <Popup className="premium-popup">
                      <div className="p-4 min-w-[200px]">
                        <span className="text-[9px] font-black uppercase tracking-widest text-red-500 block mb-1">Urgent Requirement</span>
                        <strong className="text-base font-black text-gray-900 block leading-tight">{r.title}</strong>
                        <p className="text-[10px] font-bold text-gray-400 mt-2 uppercase tracking-widest leading-relaxed">{r.requester?.organizationName}</p>
                        <div className="flex items-center gap-2 mt-3">
                          <div className="px-3 py-1 bg-red-50 text-red-600 text-[9px] font-black uppercase tracking-widest rounded-full border border-red-100">Priority: {r.urgencyLevel}</div>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>
          )}
        </div>
      </div>
    </div>
  );
}
