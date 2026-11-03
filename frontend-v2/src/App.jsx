import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { TableSessionProvider } from './context/TableSessionContext';
import { CartProvider } from './context/CartContext';
import { ToastProvider } from './context/ToastContext';
import { StaffAuthProvider } from './context/StaffAuthContext';

const CustomerPortal = lazy(() => import('./pages/CustomerPortal'));
const LandingTableSelector = lazy(() => import('./pages/LandingTableSelector'));
const KitchenDisplay = lazy(() => import('./pages/KitchenDisplay'));
const WaiterPortal = lazy(() => import('./pages/WaiterPortal'));
const ManagerPortal = lazy(() => import('./pages/ManagerPortal'));

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg-primary)] text-[var(--color-text-secondary)]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-[var(--color-accent)] border-t-transparent animate-spin" />
        <span className="text-xs uppercase tracking-widest font-mono">Loading Portal...</span>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <StaffAuthProvider>
          <TableSessionProvider>
            <CartProvider>
              <Suspense fallback={<LoadingFallback />}>
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

                  {/* Manager & Administration Routes */}
                  <Route path="/manager/*" element={<ManagerPortal />} />
                  <Route path="/admin" element={<Navigate to="/manager" replace />} />
                  <Route path="/staff/admin" element={<Navigate to="/manager" replace />} />

                  {/* Catch-all redirect to Landing */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Suspense>
            </CartProvider>
          </TableSessionProvider>
        </StaffAuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
