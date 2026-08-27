import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Utensils, CookingPot, ConciergeBell, LayoutDashboard, QrCode, UserCheck, Store } from 'lucide-react';

export default function Navbar({ onOpenLogin, onOpenRegister, user, onLogout }) {
  const location = useLocation();

  // Hide top navigation bar on customer table view (/table/* or /r/*)
  if (location.pathname.startsWith('/table/') || location.pathname.startsWith('/r/')) {
    return null;
  }

  const isActive = (path) => location.pathname === path || (path !== '/' && location.pathname.startsWith(path));

  return (
    <nav style={{
      background: 'rgba(15, 23, 42, 0.9)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--border-glass)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      padding: '0.8rem 1.5rem'
    }}>
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        {/* Brand Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', textDecoration: 'none' }}>
          <div style={{
            background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
            padding: '0.5rem',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)'
          }}>
            <QrCode size={22} />
          </div>
          <div>
            <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              In-Dining <span style={{ color: '#10b981' }}>QR</span>
            </span>
            <span style={{ display: 'block', fontSize: '0.62rem', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.05em' }}>
              MULTI-RESTAURANT SAAS
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Link to="/" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.5rem 0.9rem',
            borderRadius: '8px',
            fontSize: '0.875rem',
            fontWeight: 600,
            background: isActive('/') ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
            color: isActive('/') ? '#10b981' : 'var(--text-muted)',
            border: isActive('/') ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid transparent',
            transition: 'all 0.2s ease'
          }}>
            <QrCode size={16} /> Home / Scanner
          </Link>

          <Link to="/kitchen" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.5rem 0.9rem',
            borderRadius: '8px',
            fontSize: '0.875rem',
            fontWeight: 600,
            background: isActive('/kitchen') ? 'rgba(6, 182, 212, 0.15)' : 'transparent',
            color: isActive('/kitchen') ? '#38bdf8' : 'var(--text-muted)',
            border: isActive('/kitchen') ? '1px solid rgba(6, 182, 212, 0.3)' : '1px solid transparent',
            transition: 'all 0.2s ease'
          }}>
            <CookingPot size={16} /> Kitchen Display
          </Link>

          <Link to="/waiter" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.5rem 0.9rem',
            borderRadius: '8px',
            fontSize: '0.875rem',
            fontWeight: 600,
            background: isActive('/waiter') ? 'rgba(245, 158, 11, 0.15)' : 'transparent',
            color: isActive('/waiter') ? '#fbbf24' : 'var(--text-muted)',
            border: isActive('/waiter') ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid transparent',
            transition: 'all 0.2s ease'
          }}>
            <ConciergeBell size={16} /> Waiter Map
          </Link>

          {user && (
            <Link to="/manager" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.5rem 0.9rem',
              borderRadius: '8px',
              fontSize: '0.875rem',
              fontWeight: 600,
              background: isActive('/manager') ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
              color: isActive('/manager') ? '#818cf8' : 'var(--text-muted)',
              border: isActive('/manager') ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid transparent',
              transition: 'all 0.2s ease'
            }}>
              <LayoutDashboard size={16} /> Admin Portal
            </Link>
          )}
        </div>

        {/* User Auth Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
              {user.restaurantName && (
                <span style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.3rem 0.65rem',
                  borderRadius: '9999px',
                  backgroundColor: 'rgba(249, 115, 22, 0.15)',
                  border: '1px solid rgba(249, 115, 22, 0.3)',
                  color: '#fb923c',
                  fontSize: '0.75rem',
                  fontWeight: '700'
                }}>
                  <Store size={12} /> {user.restaurantName}
                </span>
              )}
              <span className="badge badge-available" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <UserCheck size={12} /> {user.fullName} ({user.role})
              </span>
              <button onClick={onLogout} className="btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}>
                Logout
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button
                onClick={onOpenRegister}
                style={{
                  padding: '0.5rem 0.9rem',
                  fontSize: '0.85rem',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                  color: '#fff',
                  fontWeight: '700',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(249, 115, 22, 0.3)'
                }}
              >
                + Register Restaurant
              </button>
              <button onClick={onOpenLogin} className="btn-secondary" style={{ padding: '0.5rem 0.9rem', fontSize: '0.85rem' }}>
                Staff Login
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
