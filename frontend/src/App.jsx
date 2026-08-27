import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
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

  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('staffUser');
    return saved ? JSON.parse(saved) : null;
  });

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    localStorage.setItem('staffUser', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('staffUser');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
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
