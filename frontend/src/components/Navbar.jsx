import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { QrCode, CookingPot, ConciergeBell, LayoutDashboard, UserCheck, Store, Menu, X, PlusCircle, LogIn } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

export default function Navbar({ onOpenLogin, onOpenRegister, user, onLogout }) {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Hide top navigation bar on customer table view (/table/* or /r/*)
  if (location.pathname.startsWith('/table/') || location.pathname.startsWith('/r/')) {
    return null;
  }

  const isActive = (path) => location.pathname === path || (path !== '/' && location.pathname.startsWith(path));

  const navLinks = [
    { to: '/', label: 'Scanner & Home', icon: QrCode, activeColor: '#10b981', activeBg: 'rgba(16, 185, 129, 0.15)', activeBorder: 'rgba(16, 185, 129, 0.35)' },
    { to: '/kitchen', label: 'Kitchen (KDS)', icon: CookingPot, activeColor: '#38bdf8', activeBg: 'rgba(6, 182, 212, 0.15)', activeBorder: 'rgba(6, 182, 212, 0.35)' },
    { to: '/waiter', label: 'Waiter Portal', icon: ConciergeBell, activeColor: '#fbbf24', activeBg: 'rgba(245, 158, 11, 0.15)', activeBorder: 'rgba(245, 158, 11, 0.35)' },
    ...(user && user.role === 'ADMIN' ? [
      { to: '/manager', label: 'Admin Portal', icon: LayoutDashboard, activeColor: '#818cf8', activeBg: 'rgba(99, 102, 241, 0.15)', activeBorder: 'rgba(99, 102, 241, 0.35)' }
    ] : [])
  ];

  return (
    <nav style={{
      background: 'var(--bg-nav)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderBottom: '1px solid var(--border-glass)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      padding: '0.75rem 1.25rem',
      transition: 'background 0.25s ease, border-color 0.25s ease'
    }}>
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem'
      }}>
        {/* Brand Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', textDecoration: 'none' }}>
          <div style={{
            background: 'var(--primary)',
            padding: '0.55rem',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
          }}>
            <QrCode size={20} />
          </div>
          <div>
            <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-heading)', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              In-Dining <span style={{ color: 'var(--primary)' }}>QR</span>
            </span>
            <span style={{ display: 'block', fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.06em' }}>
              MULTI-RESTAURANT SAAS
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="desktop-nav">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.to);
            return (
              <Link
                key={link.to}
                to={link.to}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.55rem 0.95rem',
                  borderRadius: '8px',
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  background: active ? 'var(--btn-secondary-bg)' : 'transparent',
                  color: active ? 'var(--text-heading)' : 'var(--text-muted)',
                  border: active ? '1px solid var(--border-glass-light)' : '1px solid transparent',
                  transition: 'all 0.15s ease'
                }}
              >
                <Icon size={16} />
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* User Auth Actions, Theme Toggle & Mobile Hamburger */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <ThemeToggle />

          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              {user.restaurantName && (
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.35rem 0.75rem',
                  borderRadius: '9999px',
                  backgroundColor: 'var(--btn-secondary-bg)',
                  border: '1px solid var(--border-glass)',
                  color: 'var(--text-main)',
                  fontSize: '0.78rem',
                  fontWeight: '600'
                }}>
                  <Store size={13} /> {user.restaurantName}
                </span>
              )}
              <span className="badge badge-available" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                <UserCheck size={13} /> {user.fullName || user.username} ({user.role})
              </span>
              <button
                onClick={onLogout}
                className="btn-secondary"
                style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem', minHeight: '36px' }}
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button
                onClick={onOpenRegister}
                className="btn-primary"
                style={{
                  padding: '0.55rem 1rem',
                  fontSize: '0.88rem',
                  minHeight: '38px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                }}
              >
                <PlusCircle size={16} /> Register Restaurant
              </button>
              <button
                onClick={onOpenLogin}
                className="btn-secondary"
                style={{ padding: '0.55rem 1rem', fontSize: '0.88rem', minHeight: '38px' }}
              >
                <LogIn size={15} /> Staff Login
              </button>
            </div>
          )}

          {/* Mobile Menu Trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            className="mobile-menu-btn"
            style={{
              padding: '0.5rem',
              borderRadius: '8px',
              background: 'var(--btn-secondary-bg)',
              color: 'var(--text-main)',
              border: '1px solid var(--border-glass)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '38px',
              height: '38px'
            }}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div style={{
          marginTop: '0.75rem',
          paddingTop: '0.75rem',
          borderTop: '1px solid var(--border-glass)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.25rem 0.5rem 0.5rem', borderBottom: '1px solid var(--border-glass)' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Appearance</span>
            <ThemeToggle />
          </div>
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.to);
            return (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  padding: '0.75rem 1rem',
                  borderRadius: '10px',
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  background: active ? link.activeBg : 'rgba(255, 255, 255, 0.04)',
                  color: active ? link.activeColor : 'var(--text-main)',
                  border: active ? `1px solid ${link.activeBorder}` : '1px solid transparent'
                }}
              >
                <Icon size={18} />
                {link.label}
              </Link>
            );
          })}
        </div>
      )}

      <style>{`
        @media (min-width: 860px) {
          .desktop-nav { display: flex !important; }
          .mobile-menu-btn { display: none !important; }
        }
      `}</style>
    </nav>
  );
}
