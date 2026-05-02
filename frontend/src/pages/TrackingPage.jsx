import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import Navbar from '../components/common/Navbar';
import Spinner from '../components/common/Spinner';
import api from '../utils/api';
import { toast } from 'react-toastify';

// Fix Leaflet icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function RecenterMap({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) map.setView(position, 15);
  }, [position, map]);
  return null;
}

export default function TrackingPage() {
  const { donationId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const socket = useSocket();
  const [donation, setDonation] = useState(null);
  const [vLocation, setVLocation] = useState(null);
  const [historyPath, setHistoryPath] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrackingData = async () => {
      try {
        const res = await api.get(`/tracking/${donationId}`);
        setDonation(res.data.donation);
        setHistoryPath(res.data.path || []);
        
        const loc = res.data.donation.location?.coordinates;
        if (loc) {
          setVLocation([loc[1], loc[0]]);
        }
      } catch (err) {
        toast.error('Failed to load tracking data');
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchTrackingData();
  }, [donationId, navigate]);

  const handleStatusAction = async (action) => {
    try {
      const res = await api.put(`/donations/${donationId}/${action}`);
      setDonation(res.data);
      const messages = {
        pickup: 'Marked as picked up',
        ontheway: 'Marked as on the way!',
        deliver: 'Delivery completed! Great job!'
      };
      toast.success(messages[action] || 'Status updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    }
  };

  useEffect(() => {
    if (!socket || !donationId || !donation) return;
    socket.emit('join_room', `tracking_${donationId}`);
    
    // If current user is the volunteer, start emitting location
    let watchId;
    if (donation.volunteer?._id === user._id) {
      watchId = navigator.geolocation.watchPosition(
        pos => {
          socket.emit('volunteer_location_update', {
            donationId,
            lat: pos.coords.latitude,
            lng: pos.coords.longitude
          });
          setVLocation([pos.coords.latitude, pos.coords.longitude]);
        },
        err => console.error('Geolocation error:', err),
        { enableHighAccuracy: true }
      );
    }

    socket.on('location_updated', (data) => {
      if (donation.volunteer?._id !== user._id) {
        const newPos = [data.lat, data.lng];
        setVLocation(newPos);
        setHistoryPath(prev => [...prev, { lat: data.lat, lng: data.lng }]);
      }
    });

    socket.on('status_changed', (data) => {
      setDonation(data.donation);
      toast.info(`Status Update: ${data.status.replace('_', ' ')}`);
    });

    return () => {
      socket.emit('leave_room', `tracking_${donationId}`);
      socket.off('location_updated');
      socket.off('status_changed');
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, [socket, donationId, donation, user._id]);

  if (loading) return <Spinner center />;

  const statusSteps = ['available', 'accepted', 'picked_up', 'on_the_way', 'delivered'];
  const currentStep = statusSteps.indexOf(donation.status);

  // Format path for Leaflet
  const polylinePositions = historyPath.map(p => [p.lat, p.lng]);

  return (
    <div className="min-h-screen bg-[#fcfdfd] flex flex-col">
      <Navbar />
      
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Map Section */}
        <div className="flex-1 h-[50vh] lg:h-auto relative z-0">
          <MapContainer center={vLocation || [20.5937, 78.9629]} zoom={13} style={{ height: '100%', width: '100%' }} className="grayscale-[0.2] contrast-[1.1]">
            <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
            
            {polylinePositions.length > 1 && (
              <Polyline positions={polylinePositions} color="#10b981" weight={4} opacity={0.6} dashArray="10, 10" />
            )}

            {vLocation && (
              <Marker position={vLocation}>
                <Popup>
                  <div className="p-2 font-black text-xs uppercase tracking-widest">Volunteer Location</div>
                </Popup>
              </Marker>
            )}
            <RecenterMap position={vLocation} />
          </MapContainer>
          
          {/* Map Overlay Info */}
          <div className="absolute bottom-8 left-8 z-10 hidden lg:block">
            <div className="bg-white/80 backdrop-blur-xl p-6 rounded-[2rem] border border-white/50 shadow-2xl max-w-xs">
              <p className="text-[10px] font-black text-primary-600 uppercase tracking-widest mb-2 flex items-center gap-2">
                <span className="w-2 h-2 bg-primary-500 rounded-full animate-ping" />
                Live Location
              </p>
              <p className="text-sm font-bold text-gray-500 leading-relaxed">Tracking the volunteer in real-time. Expected arrival shortly.</p>
            </div>
          </div>
        </div>

        {/* Tracking Sidebar */}
        <div className="w-full lg:w-[28rem] bg-white shadow-2xl z-10 flex flex-col relative">
          <div className="p-10 border-b border-gray-50">
            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-[9px] font-black uppercase tracking-widest rounded-full">Active Tracking</span>
              <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Order #{donation._id.slice(-6)}</span>
            </div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight leading-tight">{donation.title}</h1>
          </div>

          <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
            {/* Status Timeline */}
            <div className="relative pl-12 space-y-12 before:absolute before:left-4 before:top-2 before:bottom-2 before:w-1 before:bg-gray-50">
              {statusSteps.map((step, idx) => {
                const isCompleted = idx <= currentStep;
                const isCurrent = idx === currentStep;
                return (
                  <div key={step} className="relative group">
                    <div className={`absolute -left-12 top-1.5 w-9 h-9 rounded-2xl border-4 border-white shadow-xl z-10 flex items-center justify-center transition-all duration-500 ${
                      isCompleted ? 'bg-primary-600 scale-110 shadow-primary-200' : 'bg-gray-100'
                    }`}>
                      {isCompleted ? (
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/></svg>
                      ) : (
                        <div className="w-1.5 h-1.5 bg-gray-300 rounded-full" />
                      )}
                    </div>
                    <div>
                      <h3 className={`text-sm font-black uppercase tracking-widest transition-colors ${isCompleted ? 'text-gray-900' : 'text-gray-300'}`}>
                        {step.replace('_', ' ')}
                      </h3>
                      {isCurrent && (
                        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[10px] text-primary-500 font-black uppercase tracking-widest mt-2 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-pulse" />
                          Processing...
                        </motion.p>
                      )}
                      {isCompleted && !isCurrent && (
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Confirmed</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Volunteer/Donor Info */}
            <div className="mt-16 p-8 bg-slate-900 rounded-[2.5rem] relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
              <h4 className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-6">Assigned Volunteer</h4>
              {donation.volunteer ? (
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                    <svg className="w-7 h-7 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                  </div>
                  <div>
                    <div className="font-black text-white text-lg">{donation.volunteer.name}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <svg key={i} className={`w-3 h-3 ${i < Math.floor(donation.volunteer.rating || 5) ? 'text-primary-400' : 'text-white/20'}`} fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                        ))}
                      </div>
                      <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">{donation.volunteer.rating?.toFixed(1) || '5.0'} Rating</span>
                    </div>
                  </div>
                  <a href={`tel:${donation.volunteer.phone}`} className="ml-auto w-12 h-12 rounded-2xl bg-primary-600 text-white flex items-center justify-center shadow-lg hover:bg-primary-500 transition-all active:scale-90">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                  </a>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-white/5 border border-dashed border-white/20 flex items-center justify-center animate-pulse">
                    <svg className="w-7 h-7 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                  </div>
                  <p className="text-sm font-bold text-white/40 uppercase tracking-widest leading-relaxed">Awaiting volunteer assignment...</p>
                </div>
              )}
            </div>
          </div>

          <div className="p-10 border-t border-gray-50 space-y-4">
            {donation.volunteer?._id === user._id && donation.status !== 'delivered' && (
              <div className="space-y-4">
                <p className="text-[10px] font-black text-primary-600 uppercase tracking-widest text-center mb-4">Quick Actions</p>
                {donation.status === 'accepted' && (
                  <button onClick={() => handleStatusAction('pickup')} className="w-full bg-primary-600 text-white py-5 rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-xl shadow-primary-200 hover:bg-primary-700 transition-all active:scale-95">Mark Picked Up</button>
                )}
                {donation.status === 'picked_up' && (
                  <button onClick={() => handleStatusAction('ontheway')} className="w-full bg-blue-600 text-white py-5 rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95">Mark On The Way</button>
                )}
                {donation.status === 'on_the_way' && (
                  <button onClick={() => handleStatusAction('deliver')} className="w-full bg-emerald-600 text-white py-5 rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-xl shadow-emerald-200 hover:bg-emerald-700 transition-all active:scale-95">Mark Delivered</button>
                )}
              </div>
            )}
            <button 
              onClick={() => navigate('/dashboard')}
              className="w-full bg-gray-50 text-gray-900 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-gray-100 transition-all active:scale-95 border border-gray-100"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
