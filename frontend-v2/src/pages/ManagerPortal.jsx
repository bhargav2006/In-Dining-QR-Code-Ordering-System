import React, { useState, useEffect, useCallback } from 'react';
import { useStaffAuth } from '../context/StaffAuthContext';
import { useToast } from '../context/ToastContext';
import managerService from '../services/managerService';
import ManagerHeader from '../components/manager/ManagerHeader';
import ManagerSidebar from '../components/manager/ManagerSidebar';
import ManagerStats from '../components/manager/ManagerStats';
import TopDishesSummary from '../components/manager/TopDishesSummary';
import CategoryManagement from '../components/manager/CategoryManagement';
import DishManagement from '../components/manager/DishManagement';
import TableManagement from '../components/manager/TableManagement';
import OrderHistory from '../components/manager/OrderHistory';
import ManagerLoginModal from '../components/manager/ManagerLoginModal';
import Button from '../components/ui/Button';

export default function ManagerPortal() {
  const { staffUser, isAuthenticated, isAdminAuthorized, role, login, logout } = useStaffAuth();
  const { toast } = useToast();

  const [activeSection, setActiveSection] = useState('overview'); // 'overview' | 'categories' | 'dishes' | 'tables' | 'orders'
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  // Core Data States
  const [analytics, setAnalytics] = useState(null);
  const [categories, setCategories] = useState([]);
  const [dishes, setDishes] = useState([]);
  const [tables, setTables] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [processingActionIds, setProcessingActionIds] = useState(new Set());

  // Master Synchronized Data Fetcher
  const fetchAllManagerData = useCallback(async (isSilent = false) => {
    if (!isAuthenticated || !isAdminAuthorized) return;

    if (!isSilent) setLoading(true);
    setError(null);

    try {
      const [analyticsData, categoriesData, dishesData, tablesData, ordersData] = await Promise.all([
        managerService.getAnalytics(),
        managerService.getCategories(),
        managerService.getDishes(),
        managerService.getTables(),
        managerService.getAllOrders(),
      ]);

      setAnalytics(analyticsData);
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
      setDishes(Array.isArray(dishesData) ? dishesData : []);
      setTables(Array.isArray(tablesData) ? tablesData : []);
      setOrders(Array.isArray(ordersData) ? ordersData : []);
    } catch (err) {
      console.error('Failed to load manager data:', err);
      setError(err.message || 'Failed to synchronize with restaurant database');
      toast.error(`Sync error: ${err.message}`);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [isAuthenticated, isAdminAuthorized, toast]);

  useEffect(() => {
    fetchAllManagerData();
  }, [fetchAllManagerData]);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await fetchAllManagerData(true);
    toast.success('Restaurant data updated!');
  };

  // --- Category Handlers ---
  const handleSaveCategory = async (catDto) => {
    const actionKey = 'category-save';
    setProcessingActionIds((prev) => new Set(prev).add(actionKey));
    try {
      if (catDto.id) {
        const updated = await managerService.updateCategory(catDto.id, catDto);
        setCategories((prev) => prev.map((c) => (c.id === catDto.id ? updated : c)));
        toast.success(`Category "${updated.name}" updated successfully`);
      } else {
        const created = await managerService.createCategory(catDto);
        setCategories((prev) => [...prev, created].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)));
        toast.success(`Category "${created.name}" created!`);
      }
    } catch (err) {
      toast.error(`Category error: ${err.message}`);
      throw err;
    } finally {
      setProcessingActionIds((prev) => {
        const next = new Set(prev);
        next.delete(actionKey);
        return next;
      });
    }
  };

  const handleDeleteCategory = async (id) => {
    const actionKey = `category-delete-${id}`;
    setProcessingActionIds((prev) => new Set(prev).add(actionKey));
    try {
      await managerService.deleteCategory(id);
      setCategories((prev) => prev.filter((c) => c.id !== id));
      toast.success('Category removed from menu');
    } catch (err) {
      toast.error(`Failed to delete category: ${err.message}`);
    } finally {
      setProcessingActionIds((prev) => {
        const next = new Set(prev);
        next.delete(actionKey);
        return next;
      });
    }
  };

  // --- Dish Handlers ---
  const handleSaveDish = async (dishDto) => {
    const actionKey = 'dish-save';
    setProcessingActionIds((prev) => new Set(prev).add(actionKey));
    try {
      if (dishDto.id) {
        const updated = await managerService.updateDish(dishDto.id, dishDto);
        setDishes((prev) => prev.map((d) => (d.id === dishDto.id ? updated : d)));
        toast.success(`Dish "${updated.name}" updated successfully`);
      } else {
        const created = await managerService.createDish(dishDto);
        setDishes((prev) => [...prev, created]);
        toast.success(`Dish "${created.name}" added to menu!`);
      }
    } catch (err) {
      toast.error(`Dish error: ${err.message}`);
      throw err;
    } finally {
      setProcessingActionIds((prev) => {
        const next = new Set(prev);
        next.delete(actionKey);
        return next;
      });
    }
  };

  const handleToggleDishAvailability = async (id) => {
    const actionKey = `dish-toggle-${id}`;
    if (processingActionIds.has(actionKey)) return;

    setProcessingActionIds((prev) => new Set(prev).add(actionKey));
    try {
      const updated = await managerService.toggleDishAvailability(id);
      setDishes((prev) => prev.map((d) => (d.id === id ? updated : d)));
      if (updated.isAvailable) {
        toast.success(`"${updated.name}" is now IN STOCK on customer menu`);
      } else {
        toast.info(`"${updated.name}" 86’d (marked Out of Stock)`);
      }
    } catch (err) {
      toast.error(`Availability toggle failed: ${err.message}`);
    } finally {
      setProcessingActionIds((prev) => {
        const next = new Set(prev);
        next.delete(actionKey);
        return next;
      });
    }
  };

  const handleDeleteDish = async (id) => {
    const actionKey = `dish-delete-${id}`;
    setProcessingActionIds((prev) => new Set(prev).add(actionKey));
    try {
      await managerService.deleteDish(id);
      setDishes((prev) => prev.filter((d) => d.id !== id));
      toast.success('Dish removed from menu');
    } catch (err) {
      toast.error(`Failed to delete dish: ${err.message}`);
    } finally {
      setProcessingActionIds((prev) => {
        const next = new Set(prev);
        next.delete(actionKey);
        return next;
      });
    }
  };

  // --- Table Handlers ---
  const handleSaveTable = async (tableDto) => {
    const actionKey = 'table-save';
    setProcessingActionIds((prev) => new Set(prev).add(actionKey));
    try {
      if (tableDto.id) {
        const updated = await managerService.updateTable(tableDto.id, tableDto);
        setTables((prev) => prev.map((t) => (t.id === tableDto.id ? updated : t)));
        toast.success(`Table #${updated.tableNumber} updated successfully`);
      } else {
        const created = await managerService.createTable(tableDto);
        setTables((prev) => [...prev, created].sort((a, b) => a.tableNumber - b.tableNumber));
        toast.success(`Table #${created.tableNumber} created with new QR Token!`);
      }
    } catch (err) {
      toast.error(`Table error: ${err.message}`);
      throw err;
    } finally {
      setProcessingActionIds((prev) => {
        const next = new Set(prev);
        next.delete(actionKey);
        return next;
      });
    }
  };

  const handleDeleteTable = async (id) => {
    const actionKey = `table-delete-${id}`;
    setProcessingActionIds((prev) => new Set(prev).add(actionKey));
    try {
      await managerService.deleteTable(id);
      setTables((prev) => prev.filter((t) => t.id !== id));
      toast.success('Table deleted');
    } catch (err) {
      toast.error(`Failed to delete table: ${err.message}`);
    } finally {
      setProcessingActionIds((prev) => {
        const next = new Set(prev);
        next.delete(actionKey);
        return next;
      });
    }
  };

  const handleRegenerateQr = async (id) => {
    const actionKey = `table-qr-regen-${id}`;
    setProcessingActionIds((prev) => new Set(prev).add(actionKey));
    try {
      const updated = await managerService.regenerateQrToken(id);
      setTables((prev) => prev.map((t) => (t.id === id ? updated : t)));
      toast.success(`Table #${updated.tableNumber} QR token regenerated! Old printouts are now invalid.`);
    } catch (err) {
      toast.error(`QR regeneration failed: ${err.message}`);
    } finally {
      setProcessingActionIds((prev) => {
        const next = new Set(prev);
        next.delete(actionKey);
        return next;
      });
    }
  };

  // 1. Unauthenticated Guard
  if (!isAuthenticated) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: 'var(--color-bg)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          boxSizing: 'border-box',
        }}
      >
        <div
          style={{
            maxWidth: '520px',
            width: '100%',
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--gds-radius-2xl, 16px)',
            padding: '40px 32px',
            textAlign: 'center',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'rgba(16, 185, 129, 0.12)',
              color: 'var(--color-primary, #10b981)',
              fontSize: '2rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              border: '1px solid rgba(16, 185, 129, 0.3)',
            }}
          >
            👑
          </div>
          <h1
            style={{
              fontSize: '1.6rem',
              fontWeight: 800,
              color: 'var(--color-text)',
              marginBottom: '10px',
              letterSpacing: '-0.02em',
            }}
          >
            Manager Portal Restricted
          </h1>
          <p
            style={{
              fontSize: '0.95rem',
              color: 'var(--color-text-muted)',
              lineHeight: 1.5,
              marginBottom: '28px',
            }}
          >
            This portal is strictly reserved for Restaurant Administrators (ROLE_ADMIN) to manage menus, dishes, QR standees, and sales analytics.
          </p>

          <Button
            variant="primary"
            size="lg"
            style={{ width: '100%', marginBottom: '12px' }}
            onClick={() => setLoginModalOpen(true)}
          >
            Sign In with Administrator Account
          </Button>

          <div style={{ marginTop: '16px', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
            Preset: <code style={{ color: 'var(--color-primary, #10b981)' }}>admin / admin123</code>
          </div>
        </div>

        <ManagerLoginModal
          isOpen={loginModalOpen}
          onClose={() => setLoginModalOpen(false)}
          onLoginSuccess={login}
        />
      </div>
    );
  }

  // 2. Role Restriction Guard (blocks ROLE_KITCHEN and ROLE_WAITER)
  if (!isAdminAuthorized) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: 'var(--color-bg)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          boxSizing: 'border-box',
        }}
      >
        <div
          style={{
            maxWidth: '520px',
            width: '100%',
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--gds-radius-2xl, 16px)',
            padding: '40px 32px',
            textAlign: 'center',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'rgba(239, 68, 68, 0.12)',
              color: '#ef4444',
              fontSize: '2rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              border: '1px solid rgba(239, 68, 68, 0.3)',
            }}
          >
            🚫
          </div>
          <h1
            style={{
              fontSize: '1.6rem',
              fontWeight: 800,
              color: 'var(--color-text)',
              marginBottom: '10px',
              letterSpacing: '-0.02em',
            }}
          >
            Access Denied
          </h1>
          <p
            style={{
              fontSize: '0.95rem',
              color: 'var(--color-text-muted)',
              lineHeight: 1.5,
              marginBottom: '20px',
            }}
          >
            You are signed in as <strong>{staffUser?.username}</strong> with role{' '}
            <code style={{ color: '#ef4444' }}>{role}</code>.
            <br />
            The Manager Portal requires <strong>ROLE_ADMIN</strong> privileges.
          </p>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <Button variant="outline" size="md" onClick={logout}>
              Sign Out
            </Button>
            <Button variant="primary" size="md" onClick={() => setLoginModalOpen(true)}>
              Switch Account
            </Button>
          </div>
        </div>

        <ManagerLoginModal
          isOpen={loginModalOpen}
          onClose={() => setLoginModalOpen(false)}
          onLoginSuccess={login}
        />
      </div>
    );
  }

  // 3. Authorized Manager Dashboard Layout
  const restaurantName = staffUser?.restaurantName || 'Tasty Tacos';
  const restaurantSlug = staffUser?.restaurantSlug || 'tasty-tacos';

  const counts = {
    categories: categories.length,
    dishes: dishes.length,
    tables: tables.length,
    orders: orders.length,
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--color-bg)',
        color: 'var(--color-text)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Station Header */}
      <ManagerHeader
        restaurantName={restaurantName}
        operatorName={staffUser?.fullName || staffUser?.username}
        operatorRole={role}
        onRefresh={handleManualRefresh}
        onLogout={logout}
        onOpenLogin={() => setLoginModalOpen(true)}
        isRefreshing={isRefreshing}
        onToggleMobileMenu={() => setMobileMenuOpen(true)}
      />

      {/* Main Body Workspace with Sidebar */}
      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        {/* Sidebar Navigation */}
        <ManagerSidebar
          activeSection={activeSection}
          onSelectSection={(sec) => setActiveSection(sec)}
          counts={counts}
          isMobileOpen={mobileMenuOpen}
          onCloseMobile={() => setMobileMenuOpen(false)}
        />

        {/* Dynamic Section Content */}
        <main
          style={{
            flex: 1,
            padding: '24px',
            boxSizing: 'border-box',
            maxWidth: '1360px',
            margin: '0 auto',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
          }}
        >
          {/* Error Banner */}
          {error && (
            <div
              style={{
                padding: '12px 16px',
                borderRadius: 'var(--radius-md, 8px)',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#ef4444',
                fontSize: '0.88rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <span>⚠️ {error}</span>
              <Button variant="outline" size="sm" onClick={handleManualRefresh} style={{ color: '#ef4444', borderColor: '#ef4444' }}>
                Retry
              </Button>
            </div>
          )}

          {/* Section: Overview */}
          {activeSection === 'overview' && (
            <div>
              <div style={{ marginBottom: '16px' }}>
                <h2 style={{ fontSize: '1.3rem', fontWeight: 800, margin: '0 0 4px', color: 'var(--color-text)' }}>
                  Executive Sales & Operations Overview
                </h2>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                  Live metrics synthesized directly from verified database orders and floor activity.
                </p>
              </div>

              <ManagerStats analytics={analytics} />

              <TopDishesSummary dishes={dishes} categories={categories} orders={orders} />
            </div>
          )}

          {/* Section: Categories */}
          {activeSection === 'categories' && (
            <CategoryManagement
              categories={categories}
              dishes={dishes}
              onSaveCategory={handleSaveCategory}
              onDeleteCategory={handleDeleteCategory}
              isProcessing={loading}
            />
          )}

          {/* Section: Dishes */}
          {activeSection === 'dishes' && (
            <DishManagement
              dishes={dishes}
              categories={categories}
              onSaveDish={handleSaveDish}
              onToggleAvailability={handleToggleDishAvailability}
              onDeleteDish={handleDeleteDish}
              isProcessing={loading}
              processingActionIds={processingActionIds}
            />
          )}

          {/* Section: Tables & QR */}
          {activeSection === 'tables' && (
            <TableManagement
              tables={tables}
              restaurantName={restaurantName}
              restaurantSlug={restaurantSlug}
              onSaveTable={handleSaveTable}
              onDeleteTable={handleDeleteTable}
              onRegenerateQr={handleRegenerateQr}
              isProcessing={loading}
              processingActionIds={processingActionIds}
            />
          )}

          {/* Section: Order History */}
          {activeSection === 'orders' && (
            <OrderHistory orders={orders} />
          )}
        </main>
      </div>

      {/* Sign In Modal */}
      <ManagerLoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onLoginSuccess={login}
      />
    </div>
  );
}

