import React, { useState, useEffect } from 'react';
import { LayoutDashboard, DollarSign, ShoppingBag, Table, ToggleLeft, ToggleRight, Plus, Edit, Trash2, QrCode, RefreshCw, X, FolderPlus, ShieldAlert, Lock, Printer, Copy, Check, BarChart2, TrendingUp, Calendar, Eye, Receipt, Search, Filter, Store } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { managerApi } from '../services/api';
import { getFrontendUrl } from '../utils/url';

export default function ManagerDashboard({ user, onOpenLogin }) {
  const [activeTab, setActiveTab] = useState('analytics'); // 'analytics', 'dishes', 'categories', 'tables'
  const [analytics, setAnalytics] = useState(null);
  const [dishes, setDishes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tables, setTables] = useState([]);
  const [ordersList, setOrdersList] = useState([]);

  // Analytics & Orders filtering state
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);
  const [orderDateFilter, setOrderDateFilter] = useState('ALL'); // 'ALL', 'TODAY', 'YESTERDAY'
  const [orderSearchQuery, setOrderSearchQuery] = useState('');

  // Modals
  const [editingDish, setEditingDish] = useState(null); // null or obj
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingTable, setEditingTable] = useState(null);
  const [qrModalTable, setQrModalTable] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const loadAll = async () => {
    try {
      const restId = user?.restaurantId;
      const [stats, dishList, catList, tblList, ordList] = await Promise.all([
        managerApi.getDashboard(restId),
        managerApi.getDishes(restId),
        managerApi.getCategories(restId),
        managerApi.getTables(restId),
        managerApi.getAllOrders(restId),
      ]);

      setAnalytics(stats);
      setDishes(dishList || []);
      setCategories(catList || []);
      setTables(tblList || []);
      setOrdersList(ordList || []);
    } catch (err) {
      console.error('Error loading manager data:', err);
    }
  };

  useEffect(() => {
    if (user) {
      loadAll();
    }
  }, [user]);

  // --- Dish Handlers ---
  const handleSaveDish = async (e) => {
    e.preventDefault();
    try {
      await managerApi.saveDish(editingDish, user?.restaurantId);
      setEditingDish(null);
      loadAll();
    } catch (err) {
      alert('Error saving dish: ' + err.message);
    }
  };

  const handleToggleAvailability = async (id) => {
    try {
      await managerApi.toggleAvailability(id);
      loadAll();
    } catch (err) {
      alert('Failed to toggle availability: ' + err.message);
    }
  };

  const handleDeleteDish = async (id) => {
    if (!window.confirm('Are you sure you want to delete this dish?')) return;
    try {
      await managerApi.deleteDish(id);
      loadAll();
    } catch (err) {
      alert('Failed to delete dish: ' + err.message);
    }
  };

  // --- Category Handlers ---
  const handleSaveCategory = async (e) => {
    e.preventDefault();
    try {
      await managerApi.saveCategory(editingCategory, user?.restaurantId);
      setEditingCategory(null);
      loadAll();
    } catch (err) {
      alert('Error saving category: ' + err.message);
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Delete this category?')) return;
    try {
      await managerApi.deleteCategory(id);
      loadAll();
    } catch (err) {
      alert('Error deleting category: ' + err.message);
    }
  };

  // --- Table Handlers ---
  const handleSaveTable = async (e) => {
    e.preventDefault();
    try {
      await managerApi.saveTable(editingTable, user?.restaurantId);
      setEditingTable(null);
      loadAll();
    } catch (err) {
      alert('Error creating table: ' + err.message);
    }
  };

  const handleRegenerateQr = async (id) => {
    try {
      await managerApi.regenerateQr(id);
      loadAll();
    } catch (err) {
      alert('Error regenerating QR: ' + err.message);
    }
  };

  const handleDeleteTable = async (id) => {
    if (!window.confirm('Delete this dining table?')) return;
    try {
      await managerApi.deleteTable(id);
      loadAll();
    } catch (err) {
      alert('Error deleting table: ' + err.message);
    }
  };

  if (!user) {
    return (
      <div style={{ maxWidth: '600px', margin: '4rem auto', padding: '1rem' }}>
        <div className="glass-panel animate-fade-in" style={{ padding: '2.5rem 2rem', textAlign: 'center' }}>
          <div style={{
            display: 'inline-flex',
            padding: '1.2rem',
            background: 'rgba(99, 102, 241, 0.15)',
            color: '#818cf8',
            borderRadius: '20px',
            marginBottom: '1.2rem',
            border: '1px solid rgba(99, 102, 241, 0.3)'
          }}>
            <ShieldAlert size={48} />
          </div>

          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', marginBottom: '0.6rem' }}>
            Manager Administration Restricted
          </h2>

          <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '2rem' }}>
            Access to store analytics, menu administration, price updates, and QR table configuration requires authorized staff authentication.
          </p>

          <button
            onClick={onOpenLogin}
            className="btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '0.9rem 1.5rem', fontSize: '1rem', background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' }}
          >
            <Lock size={18} /> Staff Login to Access Manager Portal
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem 1.5rem 6rem 1.5rem' }}>
      
      {/* Dashboard Title */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          <div style={{
            background: 'rgba(99, 102, 241, 0.15)',
            color: '#818cf8',
            padding: '0.75rem',
            borderRadius: '14px',
            border: '1px solid rgba(99, 102, 241, 0.3)'
          }}>
            <LayoutDashboard size={28} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff' }}>Manager Administration</h1>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Menu management, QR table generation & sales analytics</p>
          </div>
        </div>

        <button onClick={loadAll} className="btn-secondary">
          <RefreshCw size={16} /> Refresh Analytics
        </button>
      </div>

      {/* Sales Analytics Overview Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1.25rem',
        marginBottom: '2.5rem'
      }}>
        <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', padding: '0.8rem', borderRadius: '12px' }}>
            <DollarSign size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>TODAY'S SALES</span>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff' }}>${analytics?.todaySales?.toFixed(2) || '0.00'}</h3>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'rgba(6, 182, 212, 0.15)', color: '#38bdf8', padding: '0.8rem', borderRadius: '12px' }}>
            <ShoppingBag size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>TOTAL ORDERS</span>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff' }}>{analytics?.todayOrdersCount || 0} Orders</h3>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', padding: '0.8rem', borderRadius: '12px' }}>
            <Table size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>ACTIVE TABLES</span>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff' }}>{analytics?.activeTablesCount || 0} / {analytics?.totalTablesCount || 0}</h3>
          </div>
        </div>
      </div>

      {/* Tabs Bar */}
      <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border-glass)', marginBottom: '2rem', paddingBottom: '0.5rem', flexWrap: 'wrap' }}>
        <button
          onClick={() => setActiveTab('analytics')}
          style={{
            padding: '0.6rem 1.2rem',
            borderRadius: '8px',
            fontWeight: 700,
            fontSize: '0.95rem',
            background: activeTab === 'analytics' ? 'rgba(16, 185, 129, 0.2)' : 'transparent',
            color: activeTab === 'analytics' ? '#34d399' : 'var(--text-muted)',
            border: activeTab === 'analytics' ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid transparent',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem'
          }}
        >
          <BarChart2 size={18} /> Sales & Orders Analytics ({ordersList.length})
        </button>

        <button
          onClick={() => setActiveTab('dishes')}
          style={{
            padding: '0.6rem 1.2rem',
            borderRadius: '8px',
            fontWeight: 700,
            fontSize: '0.95rem',
            background: activeTab === 'dishes' ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
            color: activeTab === 'dishes' ? '#818cf8' : 'var(--text-muted)',
            border: activeTab === 'dishes' ? '1px solid rgba(99, 102, 241, 0.4)' : '1px solid transparent'
          }}
        >
          Menu Dishes ({dishes.length})
        </button>

        <button
          onClick={() => setActiveTab('categories')}
          style={{
            padding: '0.6rem 1.2rem',
            borderRadius: '8px',
            fontWeight: 700,
            fontSize: '0.95rem',
            background: activeTab === 'categories' ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
            color: activeTab === 'categories' ? '#818cf8' : 'var(--text-muted)',
            border: activeTab === 'categories' ? '1px solid rgba(99, 102, 241, 0.4)' : '1px solid transparent'
          }}
        >
          Categories ({categories.length})
        </button>

        <button
          onClick={() => setActiveTab('tables')}
          style={{
            padding: '0.6rem 1.2rem',
            borderRadius: '8px',
            fontWeight: 700,
            fontSize: '0.95rem',
            background: activeTab === 'tables' ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
            color: activeTab === 'tables' ? '#818cf8' : 'var(--text-muted)',
            border: activeTab === 'tables' ? '1px solid rgba(99, 102, 241, 0.4)' : '1px solid transparent'
          }}
        >
          Tables & QR Generator ({tables.length})
        </button>
      </div>

      {/* --- TAB 0: SALES & ORDERS ANALYTICS --- */}
      {activeTab === 'analytics' && (
        <div>
          {/* Detailed Financial Overview Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.2rem', marginBottom: '2rem' }}>
            <div className="glass-panel" style={{ padding: '1.5rem', borderLeft: '4px solid #10b981' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700 }}>TODAY'S REVENUE</span>
                <span style={{ fontSize: '0.75rem', background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', padding: '0.2rem 0.5rem', borderRadius: '6px' }}>Today</span>
              </div>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#fff' }}>${analytics?.todaySales?.toFixed(2) || '0.00'}</h2>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '0.4rem' }}>
                Yesterday: <strong>${analytics?.yesterdaySales?.toFixed(2) || '0.00'}</strong> ({analytics?.yesterdayOrdersCount || 0} orders)
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '1.5rem', borderLeft: '4px solid #06b6d4' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700 }}>TODAY'S ORDERS</span>
                <span style={{ fontSize: '0.75rem', background: 'rgba(6, 182, 212, 0.2)', color: '#38bdf8', padding: '0.2rem 0.5rem', borderRadius: '6px' }}>Today</span>
              </div>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#fff' }}>{analytics?.todayOrdersCount || 0} Orders</h2>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '0.4rem' }}>
                Active Tables: <strong>{analytics?.activeTablesCount || 0}</strong> occupied
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '1.5rem', borderLeft: '4px solid #6366f1' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700 }}>ALL-TIME REVENUE</span>
                <span style={{ fontSize: '0.75rem', background: 'rgba(99, 102, 241, 0.2)', color: '#a5b4fc', padding: '0.2rem 0.5rem', borderRadius: '6px' }}>Lifetime</span>
              </div>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#fff' }}>${analytics?.allTimeSales?.toFixed(2) || '0.00'}</h2>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '0.4rem' }}>
                Total Orders Count: <strong>{analytics?.allTimeOrdersCount || 0}</strong>
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '1.5rem', borderLeft: '4px solid #f59e0b' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700 }}>AVG ORDER VALUE (AOV)</span>
                <span style={{ fontSize: '0.75rem', background: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24', padding: '0.2rem 0.5rem', borderRadius: '6px' }}>Avg</span>
              </div>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#fff' }}>
                ${(analytics?.allTimeOrdersCount ? (analytics.allTimeSales / analytics.allTimeOrdersCount) : 0).toFixed(2)}
              </h2>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '0.4rem' }}>
                Total Tables in Restaurant: <strong>{analytics?.totalTablesCount || 0}</strong>
              </div>
            </div>
          </div>

          {/* Orders History Header & Filter Controls */}
          <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.2rem' }}>
              <div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fff' }}>Customer Orders & Sales Log</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Detailed record of past and live customer orders</p>
              </div>

              {/* Date Filter Buttons */}
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {['ALL', 'TODAY', 'YESTERDAY'].map((f) => (
                  <button
                    key={f}
                    onClick={() => setOrderDateFilter(f)}
                    style={{
                      padding: '0.4rem 0.8rem',
                      borderRadius: '6px',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      background: orderDateFilter === f ? 'rgba(16, 185, 129, 0.25)' : 'rgba(255,255,255,0.05)',
                      color: orderDateFilter === f ? '#34d399' : 'var(--text-muted)',
                      border: orderDateFilter === f ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid var(--border-glass)'
                    }}
                  >
                    {f === 'ALL' ? 'All Orders' : (f === 'TODAY' ? 'Today' : 'Yesterday')}
                  </button>
                ))}
              </div>
            </div>

            {/* Search Input */}
            <div style={{ position: 'relative', width: '100%', marginBottom: '1rem' }}>
              <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
              <input
                type="text"
                placeholder="Search by Order # or Table #..."
                value={orderSearchQuery}
                onChange={(e) => setOrderSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem 0.75rem 2.8rem',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid var(--border-glass)',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '0.9rem',
                  outline: 'none'
                }}
              />
            </div>

            {/* Orders Table */}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-glass)', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                    <th style={{ padding: '0.8rem' }}>Order #</th>
                    <th style={{ padding: '0.8rem' }}>Table #</th>
                    <th style={{ padding: '0.8rem' }}>Date & Time</th>
                    <th style={{ padding: '0.8rem' }}>Items</th>
                    <th style={{ padding: '0.8rem' }}>Total Amount</th>
                    <th style={{ padding: '0.8rem' }}>Status</th>
                    <th style={{ padding: '0.8rem', textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {ordersList.filter((ord) => {
                    const matchesSearch = !orderSearchQuery || ord.orderNumber?.toLowerCase().includes(orderSearchQuery.toLowerCase()) || String(ord.tableNumber).includes(orderSearchQuery);
                    
                    if (!matchesSearch) return false;

                    const ordDate = new Date(ord.createdAt);
                    const today = new Date();
                    const yesterday = new Date();
                    yesterday.setDate(today.getDate() - 1);

                    if (orderDateFilter === 'TODAY') {
                      return ordDate.toDateString() === today.toDateString();
                    } else if (orderDateFilter === 'YESTERDAY') {
                      return ordDate.toDateString() === yesterday.toDateString();
                    }
                    return true;
                  }).map((ord) => (
                    <tr key={ord.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '0.8rem', fontWeight: 700, color: '#fff' }}>{ord.orderNumber}</td>
                      <td style={{ padding: '0.8rem' }}><span className="badge badge-bill">Table #{ord.tableNumber}</span></td>
                      <td style={{ padding: '0.8rem', color: 'var(--text-muted)' }}>{new Date(ord.createdAt).toLocaleString()}</td>
                      <td style={{ padding: '0.8rem' }}>
                        {ord.items?.map(i => `${i.quantity}x ${i.dishName}`).join(', ') || 'N/A'}
                      </td>
                      <td style={{ padding: '0.8rem', fontWeight: 800, color: '#34d399' }}>${ord.totalAmount?.toFixed(2)}</td>
                      <td style={{ padding: '0.8rem' }}>
                        <span className={`badge badge-${ord.status?.toLowerCase()}`}>
                          {ord.status}
                        </span>
                      </td>
                      <td style={{ padding: '0.8rem', textAlign: 'right' }}>
                        <button
                          onClick={() => setSelectedOrderDetails(ord)}
                          className="btn-secondary"
                          style={{ padding: '0.35rem 0.7rem', fontSize: '0.75rem' }}
                        >
                          <Eye size={14} /> View Details
                        </button>
                      </td>
                    </tr>
                  ))}

                  {ordersList.length === 0 && (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                        No order records found in database.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 1: MENU DISHES --- */}
      {activeTab === 'dishes' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#fff' }}>Dish Catalog</h2>
            <button
              onClick={() => setEditingDish({ name: '', description: '', price: 12.00, categoryId: categories[0]?.id || 1, isAvailable: true, imageUrl: '' })}
              className="btn-primary"
            >
              <Plus size={16} /> Add New Dish Item
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {dishes.map(dish => (
              <div key={dish.id} className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>{dish.name}</h3>
                    <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#10b981' }}>${dish.price?.toFixed(2)}</span>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.8rem' }}>{dish.description}</p>
                </div>

                <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--border-glass)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <button
                    onClick={() => handleToggleAvailability(dish.id)}
                    style={{ background: 'none', color: dish.isAvailable ? '#10b981' : '#f87171', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600, fontSize: '0.85rem' }}
                  >
                    {dish.isAvailable ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
                    {dish.isAvailable ? 'Available' : 'Unavailable'}
                  </button>

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={() => setEditingDish({ ...dish, categoryId: dish.category?.id || 1 })} className="btn-secondary" style={{ padding: '0.4rem 0.6rem' }}>
                      <Edit size={14} />
                    </button>
                    <button onClick={() => handleDeleteDish(dish.id)} className="btn-danger" style={{ padding: '0.4rem 0.6rem' }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- TAB 2: CATEGORIES --- */}
      {activeTab === 'categories' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#fff' }}>Menu Categories</h2>
            <button
              onClick={() => setEditingCategory({ name: '', displayOrder: categories.length + 1, isActive: true })}
              className="btn-primary"
            >
              <FolderPlus size={16} /> Add Category
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.25rem' }}>
            {categories.map(cat => (
              <div key={cat.id} className="glass-panel" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>{cat.name}</h3>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Display Order: #{cat.displayOrder}</span>
                </div>
                <button onClick={() => setEditingCategory(cat)} className="btn-secondary" style={{ padding: '0.4rem 0.6rem' }}>
                  <Edit size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- TAB 3: TABLES & QR --- */}
      {activeTab === 'tables' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#fff' }}>Table & QR Code Manager</h2>
            <button
              onClick={() => setEditingTable({ tableNumber: tables.length + 1, capacity: 4 })}
              className="btn-primary"
            >
              <Plus size={16} /> Add New Table
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {tables.map(tbl => (
              <div key={tbl.id} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fff' }}>Table #{tbl.tableNumber}</span>
                  <span className="badge badge-available">{tbl.capacity} Seats</span>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '0.8rem', border: '1px solid var(--border-glass)' }}>
                  <QrCode size={36} style={{ color: '#10b981' }} />
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>QR Payload Token:</span>
                    <span style={{ fontSize: '0.85rem', color: '#fff', fontWeight: 700 }}>{tbl.qrToken}</span>
                  </div>
                </div>

                {tbl.activeSessionToken && (
                  <div style={{ background: 'rgba(56, 189, 248, 0.1)', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid rgba(56, 189, 248, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#38bdf8', fontSize: '0.8rem', fontWeight: 700 }}>
                    <div>
                      <span>🔑 Session Code: </span>
                      <code style={{ color: '#fff', fontSize: '0.85rem', fontWeight: 800 }}>{tbl.activeSessionToken}</code>
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(tbl.activeSessionToken);
                        alert(`Session Code ${tbl.activeSessionToken} copied for Table #${tbl.tableNumber}!`);
                      }}
                      className="btn-secondary"
                      style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem', background: 'rgba(56, 189, 248, 0.2)', color: '#38bdf8' }}
                    >
                      📋 Copy
                    </button>
                  </div>
                )}

                <button
                  onClick={() => setQrModalTable(tbl)}
                  className="btn-primary"
                  style={{ width: '100%', justifyContent: 'center', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', padding: '0.65rem' }}
                >
                  <QrCode size={16} /> View Scannable QR Poster
                </button>

                <div style={{ display: 'flex', gap: '0.6rem' }}>
                  <button onClick={() => setEditingTable(tbl)} className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>
                    <Edit size={14} /> Edit Table
                  </button>
                  <button onClick={() => handleRegenerateQr(tbl.id)} className="btn-secondary" style={{ justifyContent: 'center' }} title="Regenerate QR Token">
                    <RefreshCw size={14} />
                  </button>
                  <button onClick={() => handleDeleteTable(tbl.id)} className="btn-secondary" style={{ color: '#f87171', justifyContent: 'center' }} title="Delete Table">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dish Add/Edit Modal */}
      {editingDish && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="glass-panel animate-fade-in" style={{ maxWidth: '480px', width: '100%', padding: '1.8rem', position: 'relative' }}>
            <button onClick={() => setEditingDish(null)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', color: 'var(--text-muted)' }}><X size={20} /></button>

            <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#fff', marginBottom: '1rem' }}>
              {editingDish.id ? 'Edit Dish Item' : 'Add New Dish Item'}
            </h3>

            <form onSubmit={handleSaveDish} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>Dish Name</label>
                <input
                  type="text"
                  value={editingDish.name || ''}
                  onChange={(e) => setEditingDish({ ...editingDish, name: e.target.value })}
                  required
                  style={{ width: '100%', padding: '0.7rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-glass)', borderRadius: '8px', color: '#fff' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>Description</label>
                <textarea
                  value={editingDish.description || ''}
                  onChange={(e) => setEditingDish({ ...editingDish, description: e.target.value })}
                  style={{ width: '100%', height: '65px', padding: '0.7rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-glass)', borderRadius: '8px', color: '#fff' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingDish.price || ''}
                    onChange={(e) => setEditingDish({ ...editingDish, price: parseFloat(e.target.value) })}
                    required
                    style={{ width: '100%', padding: '0.7rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-glass)', borderRadius: '8px', color: '#fff' }}
                  />
                </div>

                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>Category</label>
                  <select
                    value={editingDish.categoryId || 1}
                    onChange={(e) => setEditingDish({ ...editingDish, categoryId: parseInt(e.target.value) })}
                    style={{ width: '100%', padding: '0.7rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-glass)', borderRadius: '8px', color: '#fff' }}
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id} style={{ background: '#0f172a' }}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button type="submit" className="btn-primary" style={{ justifyContent: 'center', marginTop: '0.5rem' }}>
                Save Dish to Menu
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Category Modal */}
      {editingCategory && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="glass-panel animate-fade-in" style={{ maxWidth: '400px', width: '100%', padding: '1.8rem', position: 'relative' }}>
            <button onClick={() => setEditingCategory(null)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', color: 'var(--text-muted)' }}><X size={20} /></button>

            <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#fff', marginBottom: '1rem' }}>
              {editingCategory.id ? 'Edit Category' : 'Add Category'}
            </h3>

            <form onSubmit={handleSaveCategory} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>Category Name</label>
                <input
                  type="text"
                  value={editingCategory.name || ''}
                  onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                  required
                  style={{ width: '100%', padding: '0.7rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-glass)', borderRadius: '8px', color: '#fff' }}
                />
              </div>

              <button type="submit" className="btn-primary" style={{ justifyContent: 'center' }}>
                Save Category
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Table Modal */}
      {editingTable && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="glass-panel animate-fade-in" style={{ maxWidth: '400px', width: '100%', padding: '1.8rem', position: 'relative' }}>
            <button onClick={() => setEditingTable(null)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', color: 'var(--text-muted)' }}><X size={20} /></button>

            <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#fff', marginBottom: '1rem' }}>
              {editingTable.id ? `Edit Dining Table #${editingTable.tableNumber}` : 'Add Dining Table'}
            </h3>

            <form onSubmit={handleSaveTable} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>Table Number</label>
                <input
                  type="number"
                  value={editingTable.tableNumber || ''}
                  onChange={(e) => setEditingTable({ ...editingTable, tableNumber: parseInt(e.target.value) })}
                  required
                  style={{ width: '100%', padding: '0.7rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-glass)', borderRadius: '8px', color: '#fff' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>Seating Capacity</label>
                <input
                  type="number"
                  value={editingTable.capacity || ''}
                  onChange={(e) => setEditingTable({ ...editingTable, capacity: parseInt(e.target.value) })}
                  required
                  style={{ width: '100%', padding: '0.7rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-glass)', borderRadius: '8px', color: '#fff' }}
                />
              </div>

              <button type="submit" className="btn-primary" style={{ justifyContent: 'center' }}>
                {editingTable.id ? 'Save Table Changes' : 'Save & Generate QR Token'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Scannable QR Code Poster Modal */}
      {qrModalTable && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="glass-panel animate-fade-in" style={{ maxWidth: '440px', width: '100%', padding: '2rem', position: 'relative', textAlign: 'center' }}>
            <button onClick={() => setQrModalTable(null)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', color: 'var(--text-muted)' }}><X size={20} /></button>

            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', marginBottom: '0.3rem' }}>
              Table #{qrModalTable.tableNumber} Smart QR Standee
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              Scan with Smartphone Camera or Google Lens to view menu & order
            </p>

            {/* Scannable Vector QR Card Frame */}
            <div style={{
              background: '#ffffff',
              padding: '1.8rem 1.5rem 1.2rem 1.5rem',
              borderRadius: '20px',
              display: 'inline-flex',
              flexDirection: 'column',
              alignItems: 'center',
              boxShadow: '0 15px 35px rgba(0,0,0,0.6)',
              marginBottom: '1.5rem'
            }}>
              <QRCodeSVG
                value={user?.restaurantSlug ? `${getFrontendUrl()}/r/${user.restaurantSlug}/table/${qrModalTable.tableNumber}` : `${getFrontendUrl()}/table/${qrModalTable.tableNumber}`}
                size={220}
                level="H"
                includeMargin={true}
              />
              <div style={{ color: '#0f172a', fontWeight: 800, fontSize: '1.1rem', marginTop: '0.8rem', textTransform: 'uppercase' }}>
                {user?.restaurantName || 'GOURMET RESTAURANT'}
              </div>
              <div style={{ color: '#10b981', fontWeight: 700, fontSize: '0.85rem' }}>
                TABLE #{qrModalTable.tableNumber} • {qrModalTable.capacity} SEATS
              </div>
              <div style={{ color: '#64748b', fontSize: '0.7rem', marginTop: '0.4rem', wordBreak: 'break-all', maxWidth: '240px' }}>
                {user?.restaurantSlug ? `${getFrontendUrl()}/r/${user.restaurantSlug}/table/${qrModalTable.tableNumber}` : `${getFrontendUrl()}/table/${qrModalTable.tableNumber}`}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.8rem' }}>
              <button
                onClick={() => {
                  const targetUrl = user?.restaurantSlug ? `${getFrontendUrl()}/r/${user.restaurantSlug}/table/${qrModalTable.tableNumber}` : `${getFrontendUrl()}/table/${qrModalTable.tableNumber}`;
                  navigator.clipboard.writeText(targetUrl);
                  setCopiedLink(true);
                  setTimeout(() => setCopiedLink(false), 2000);
                }}
                className="btn-secondary"
                style={{ flex: 1, justifyContent: 'center' }}
              >
                {copiedLink ? <Check size={16} style={{ color: '#10b981' }} /> : <Copy size={16} />}
                {copiedLink ? 'Link Copied!' : 'Copy Direct URL'}
              </button>

              <button
                onClick={() => window.print()}
                className="btn-primary"
                style={{ flex: 1, justifyContent: 'center' }}
              >
                <Printer size={16} /> Print QR Card
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- ORDER DETAILS MODAL --- */}
      {selectedOrderDetails && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }}>
          <div className="glass-panel animate-fade-in" style={{ maxWidth: '500px', width: '100%', padding: '2rem', position: 'relative' }}>
            <button onClick={() => setSelectedOrderDetails(null)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', color: 'var(--text-muted)' }}>
              <X size={20} />
            </button>

            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <span className="badge badge-bill" style={{ fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                Table #{selectedOrderDetails.tableNumber}
              </span>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff' }}>
                Order #{selectedOrderDetails.orderNumber}
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {new Date(selectedOrderDetails.createdAt).toLocaleString()}
              </p>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.04)', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', border: '1px solid var(--border-glass)' }}>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#38bdf8', marginBottom: '0.8rem' }}>Ordered Items</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {selectedOrderDetails.items?.map((it, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                    <span>{it.quantity}x {it.dishName}</span>
                    <span style={{ fontWeight: 700, color: '#fff' }}>
                      ${(it.itemTotal || (it.unitPrice ? it.unitPrice * it.quantity : (it.price ? it.price * it.quantity : 0))).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
              <div style={{ borderTop: '1px dashed var(--border-glass)', marginTop: '0.8rem', paddingTop: '0.8rem', display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1rem', color: '#34d399' }}>
                <span>Total Amount:</span>
                <span>${selectedOrderDetails.totalAmount?.toFixed(2)}</span>
              </div>
            </div>

            {selectedOrderDetails.notes && (
              <div style={{ background: 'rgba(245, 158, 11, 0.1)', padding: '0.8rem', borderRadius: '8px', border: '1px solid rgba(245, 158, 11, 0.3)', marginBottom: '1.5rem', fontSize: '0.85rem', color: '#fbbf24' }}>
                <strong>Customer Notes:</strong> {selectedOrderDetails.notes}
              </div>
            )}

            <button onClick={() => setSelectedOrderDetails(null)} className="btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>
              Close Order Details
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
