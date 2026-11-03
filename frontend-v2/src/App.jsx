import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { TableSessionProvider } from './context/TableSessionContext';
import { CartProvider } from './context/CartContext';
import { ToastProvider } from './context/ToastContext';
import { StaffAuthProvider } from './context/StaffAuthContext';
import CustomerPortal from './pages/CustomerPortal';
import LandingTableSelector from './pages/LandingTableSelector';
import KitchenDisplay from './pages/KitchenDisplay';
import WaiterPortal from './pages/WaiterPortal';

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <StaffAuthProvider>
          <TableSessionProvider>
            <CartProvider>
              <Routes>
                {/* Table Selection Landing */}
                <Route path="/" element={<LandingTableSelector />} />

                {/* Verified Customer Dine-In Routes */}
                <Route path="/table/:tableNumber" element={<CustomerPortal />} />
                <Route path="/r/:restaurantSlug/table/:tableNumber" element={<CustomerPortal />} />
                <Route path="/qr/:qrToken" element={<CustomerPortal />} />

                {/* Kitchen Display System Routes */}
                <Route path="/kitchen" element={<KitchenDisplay />} />
                <Route path="/kds" element={<Navigate to="/kitchen" replace />} />
                <Route path="/staff/login" element={<KitchenDisplay />} />

                {/* Waiter Floor Management Routes */}
                <Route path="/waiter" element={<WaiterPortal />} />
                <Route path="/floor" element={<Navigate to="/waiter" replace />} />
                <Route path="/staff/waiter" element={<Navigate to="/waiter" replace />} />

                {/* Catch-all redirect to Landing */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </CartProvider>
          </TableSessionProvider>
        </StaffAuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
