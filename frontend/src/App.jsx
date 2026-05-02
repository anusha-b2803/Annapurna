import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import DonationsPage from './pages/DonationsPage';
import DonationDetailPage from './pages/DonationDetailPage';
import CreateDonationPage from './pages/CreateDonationPage';
import RequestsPage from './pages/RequestsPage';
import CreateRequestPage from './pages/CreateRequestPage';
import TrackingPage from './pages/TrackingPage';
import CommunityPage from './pages/CommunityPage';
import ProfilePage from './pages/ProfilePage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import RequestDetailPage from './pages/RequestDetailPage';
import MapPage from './pages/MapPage';
import SettingsPage from './pages/SettingsPage';
import NotFoundPage from './pages/NotFoundPage';

const PrivateRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return children;
};

const PublicRoute = ({ children }) => {
  const { user } = useAuth();
  if (user) return <Navigate to="/dashboard" replace />;
  return children;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
      <Route path="/dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
      <Route path="/donations" element={<PrivateRoute><DonationsPage /></PrivateRoute>} />
      <Route path="/donations/new" element={<PrivateRoute roles={['donor', 'admin']}><CreateDonationPage /></PrivateRoute>} />
      <Route path="/donations/:id" element={<PrivateRoute><DonationDetailPage /></PrivateRoute>} />
      <Route path="/requests" element={<PrivateRoute><RequestsPage /></PrivateRoute>} />
      <Route path="/requests/:id" element={<PrivateRoute><RequestDetailPage /></PrivateRoute>} />
      <Route path="/requests/new" element={<PrivateRoute roles={['orphanage', 'admin']}><CreateRequestPage /></PrivateRoute>} />
      <Route path="/tracking/:donationId" element={<PrivateRoute><TrackingPage /></PrivateRoute>} />
      <Route path="/map" element={<PrivateRoute><MapPage /></PrivateRoute>} />
      <Route path="/community" element={<PrivateRoute><CommunityPage /></PrivateRoute>} />
      <Route path="/profile/:id" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
      <Route path="/settings" element={<PrivateRoute><SettingsPage /></PrivateRoute>} />
      <Route path="/admin" element={<PrivateRoute roles={['admin']}><AdminDashboardPage /></PrivateRoute>} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <SocketProvider>
          <AppRoutes />
          <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick pauseOnHover />
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
