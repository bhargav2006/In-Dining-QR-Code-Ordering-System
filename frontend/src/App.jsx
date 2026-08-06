import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import StaffLoginModal from './components/StaffLoginModal';
import LandingPage from './pages/LandingPage';
import CustomerPortal from './pages/CustomerPortal';
import KitchenDisplay from './pages/KitchenDisplay';
import WaiterPortal from './pages/WaiterPortal';
import ManagerDashboard from './pages/ManagerDashboard';
import PaymentSuccess from './pages/PaymentSuccess';

export default function App() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
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
      <Navbar onOpenLogin={() => setIsLoginOpen(true)} user={user} onLogout={handleLogout} />

      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/table/:tableNumber" element={<CustomerPortal />} />
          <Route path="/table/:tableNumber/success" element={<PaymentSuccess />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/kitchen" element={<KitchenDisplay />} />
          <Route path="/waiter" element={<WaiterPortal />} />
          <Route path="/manager" element={<ManagerDashboard user={user} onOpenLogin={() => setIsLoginOpen(true)} />} />
        </Routes>
      </main>

      <StaffLoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
}
