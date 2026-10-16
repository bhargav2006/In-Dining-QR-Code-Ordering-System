import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { AlertCircle, ShieldAlert, X } from 'lucide-react';
import Navbar from './components/Navbar';
import StaffLoginModal from './components/StaffLoginModal';
import RestaurantRegisterModal from './components/RestaurantRegisterModal';
import QRScannerModal from './components/QRScannerModal';
import LandingPage from './pages/LandingPage';
import CustomerPortal from './pages/CustomerPortal';
import KitchenDisplay from './pages/KitchenDisplay';
import WaiterPortal from './pages/WaiterPortal';
import ManagerDashboard from './pages/ManagerDashboard';
import PaymentSuccess from './pages/PaymentSuccess';

export default function App() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [authNotification, setAuthNotification] = useState(null);

  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('staffUser');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    const handleUnauthorized = (e) => {
      setUser(null);
      localStorage.removeItem('staffUser');
      localStorage.removeItem('authToken');
      sessionStorage.removeItem('authToken');
      setAuthNotification({
        type: 'error',
        title: 'Session Expired',
        message: e.detail?.message || 'Your authentication token is missing or has expired. Please sign in again.'
      });
      setIsLoginOpen(true);
    };

    const handleForbidden = (e) => {
      setAuthNotification({
        type: 'forbidden',
        title: 'Permission Denied',
        message: e.detail?.message || 'Access restricted. Your staff role does not have authorization for this portal or action.'
      });
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    window.addEventListener('auth:forbidden', handleForbidden);

    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
      window.removeEventListener('auth:forbidden', handleForbidden);
    };
  }, []);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    localStorage.setItem('staffUser', JSON.stringify(userData));
    setAuthNotification(null);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('staffUser');
    localStorage.removeItem('authToken');
    sessionStorage.removeItem('authToken');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {authNotification && (
        <div
          role="alert"
          style={{
            position: 'fixed',
            top: '1rem',
            right: '1rem',
            zIndex: 1000,
            maxWidth: '420px',
            backgroundColor: authNotification.type === 'forbidden' ? 'rgba(239, 68, 68, 0.95)' : 'rgba(245, 158, 11, 0.95)',
            color: '#ffffff',
            padding: '1rem 1.25rem',
            borderRadius: '12px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.4), 0 0 15px rgba(239, 68, 68, 0.3)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.75rem',
            backdropFilter: 'blur(8px)',
            animation: 'fadeIn 0.25s ease-out'
          }}
        >
          {authNotification.type === 'forbidden' ? (
            <ShieldAlert size={22} style={{ flexShrink: 0, marginTop: '2px' }} />
          ) : (
            <AlertCircle size={22} style={{ flexShrink: 0, marginTop: '2px' }} />
          )}
          <div style={{ flex: 1 }}>
            <h4 style={{ fontWeight: 700, fontSize: '0.95rem', margin: 0 }}>{authNotification.title}</h4>
            <p style={{ fontSize: '0.85rem', margin: '0.25rem 0 0', opacity: 0.95, lineHeight: 1.4 }}>
              {authNotification.message}
            </p>
          </div>
          <button
            onClick={() => setAuthNotification(null)}
            aria-label="Dismiss alert"
            style={{
              background: 'transparent',
              color: '#ffffff',
              border: 'none',
              cursor: 'pointer',
              padding: '2px'
            }}
          >
            <X size={18} />
          </button>
        </div>
      )}

      <Navbar
        onOpenLogin={() => setIsLoginOpen(true)}
        onOpenRegister={() => setIsRegisterOpen(true)}
        user={user}
        onLogout={handleLogout}
      />

      <main style={{ flex: 1 }}>
        <Routes>
          <Route
            path="/"
            element={
              <LandingPage
                onOpenLogin={() => setIsLoginOpen(true)}
                onOpenRegister={() => setIsRegisterOpen(true)}
                onOpenScanner={() => setIsScannerOpen(true)}
              />
            }
          />
          <Route path="/table/:tableNumber" element={<CustomerPortal />} />
          <Route path="/r/:restaurantSlug/table/:tableNumber" element={<CustomerPortal />} />
          <Route path="/table/:tableNumber/success" element={<PaymentSuccess />} />
          <Route path="/r/:restaurantSlug/table/:tableNumber/success" element={<PaymentSuccess />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/kitchen" element={<KitchenDisplay user={user} onOpenLogin={() => setIsLoginOpen(true)} />} />
          <Route path="/waiter" element={<WaiterPortal user={user} onOpenLogin={() => setIsLoginOpen(true)} />} />
          <Route path="/manager" element={<ManagerDashboard user={user} onOpenLogin={() => setIsLoginOpen(true)} />} />
        </Routes>
      </main>

      <StaffLoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      <RestaurantRegisterModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        onRegisterSuccess={handleLoginSuccess}
      />

      <QRScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
      />
    </div>
  );
}
