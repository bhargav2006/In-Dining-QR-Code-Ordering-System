import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { QrCode, Sparkles, ArrowRight, Table, Smartphone, Camera, Store, PlusCircle, CheckCircle2, ShieldCheck, Zap, ChefHat, ConciergeBell, LayoutDashboard, Utensils } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { customerApi, authApi } from '../services/api';
import { getFrontendUrl } from '../utils/url';
import { useToast } from '../context/ToastContext';

export default function LandingPage({ onOpenLogin, onOpenRegister, onOpenScanner }) {
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRest, setSelectedRest] = useState(null);
  const [selectedTable, setSelectedTable] = useState(1);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    loadRestaurants();
  }, []);

  const loadRestaurants = async () => {
    try {
      const data = await authApi.getRestaurants();
      if (data && data.length > 0) {
        // Exclude 'restaurant 1' as requested by user
        const filtered = data.filter(r => r.name?.toLowerCase() !== 'restaurant 1' && r.slug !== 'restaurant-1');
        setRestaurants(filtered);
        // Prioritize Fine Diner (restaurant_id: 4) if present
        const fineDiner = filtered.find(r => r.slug === 'fine-diner' || r.name?.toLowerCase().includes('fine diner'));
        setSelectedRest(fineDiner || filtered[0]);
      }
    } catch (err) {
      console.error('Failed to load restaurants:', err);
    }
  };

  const handleStartSession = async () => {
    setLoading(true);
    try {
      const restSlug = selectedRest ? selectedRest.slug : 'fine-diner';
      const restId = selectedRest ? selectedRest.id : null;
      const data = await customerApi.startSession(selectedTable, null, null, restId, restSlug);
      sessionStorage.setItem('currentSession', JSON.stringify(data));
      navigate(`/r/${restSlug}/table/${data.tableNumber}`);
    } catch (err) {
      toast.error('Error starting table session: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const qrUrl = selectedRest 
    ? `${getFrontendUrl()}/r/${selectedRest.slug}/table/${selectedTable}`
    : `${getFrontendUrl()}/table/${selectedTable}`;

  return (
    <div style={{
      maxWidth: '1280px',
      margin: '0 auto',
      padding: '2.5rem 1.5rem 4rem 1.5rem',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '3.5rem'
    }}>
      {/* SaaS Hero Banner */}
      <div className="animate-fade-in" style={{ textAlign: 'center', maxWidth: '850px' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.45rem 1.25rem',
          background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.15), rgba(234, 88, 12, 0.1))',
          color: '#fb923c',
          borderRadius: '9999px',
          fontSize: '0.85rem',
          fontWeight: 700,
          marginBottom: '1.25rem',
          border: '1px solid rgba(249, 115, 22, 0.3)'
        }}>
          <Sparkles size={16} /> MULTI-RESTAURANT TABLE QR ORDERING PLATFORM
        </div>

        <h1 style={{
          fontSize: '3.25rem',
          fontWeight: 800,
          lineHeight: 1.15,
          color: 'var(--text-heading)',
          marginBottom: '1.25rem',
          letterSpacing: '-0.03em'
        }}>
          Register Your Restaurant & <br />
          <span style={{ color: 'var(--primary)' }}>
            Automate Table QR Ordering
          </span>
        </h1>

        <p style={{ fontSize: '1.15rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '2rem' }}>
          Connect diners directly to your kitchen. Register your restaurant, manage your custom food categories and dishes, print table QR codes, and receive real-time kitchen orders.
        </p>

        {/* Hero Call to Action Buttons */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center' }}>
          <button
            onClick={onOpenRegister}
            className="btn-primary"
            style={{
              padding: '0.85rem 1.75rem',
              borderRadius: '0.625rem',
              fontSize: '1rem',
              fontWeight: 600,
            }}
          >
            <PlusCircle size={19} /> Register New Restaurant
          </button>

          <button
            onClick={onOpenScanner}
            className="btn-secondary"
            style={{
              padding: '0.85rem 1.75rem',
              borderRadius: '0.625rem',
              fontSize: '1rem',
              fontWeight: 600,
            }}
          >
            <Camera size={19} /> Scan Table QR Code
          </button>

          <button
            onClick={onOpenLogin}
            className="btn-secondary"
            style={{
              padding: '0.9rem 1.5rem',
              fontSize: '1rem',
              borderRadius: '0.85rem',
            }}
          >
            Restaurant Login
          </button>
        </div>
      </div>

      {/* Main Feature Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '1.5rem',
        width: '100%',
        maxWidth: '1100px'
      }}>
        <div className="glass-panel" style={{
          borderRadius: '1.25rem',
          padding: '1.75rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem'
        }}>
          <div style={{
            width: '48px', height: '48px', borderRadius: '1rem',
            background: 'rgba(249, 115, 22, 0.15)', color: '#fb923c',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Store size={24} />
          </div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: 'var(--text-heading)' }}>Restaurant Registration</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
            Create your own tenant workspace. Manage categories, products, prices, and staff accounts isolated to your restaurant.
          </p>
        </div>

        <div className="glass-panel" style={{
          borderRadius: '1.25rem',
          padding: '1.75rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem'
        }}>
          <div style={{
            width: '48px', height: '48px', borderRadius: '1rem',
            background: 'rgba(16, 185, 129, 0.15)', color: '#34d399',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <QrCode size={24} />
          </div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: 'var(--text-heading)' }}>Table QR Code Cards</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
            Generate unique table QR codes with instant URL links. Print table cards for customer scanning and auto-session start.
          </p>
        </div>

        <div className="glass-panel" style={{
          borderRadius: '1.25rem',
          padding: '1.75rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem'
        }}>
          <div style={{
            width: '48px', height: '48px', borderRadius: '1rem',
            background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Zap size={24} />
          </div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: 'var(--text-heading)' }}>Live Kitchen & Waiter Map</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
            Real-time Kitchen Display System (KDS), waiter assistance call alerts, and table occupancy management.
          </p>
        </div>
      </div>

      {/* Interactive QR Simulator & Table Launcher */}
      <div className="glass-panel animate-fade-in" style={{
        maxWidth: '720px',
        width: '100%',
        padding: '2.5rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '2rem'
      }}>
        <div style={{ textAlign: 'center', width: '100%' }}>
          {/* Restaurant Picker Tabs */}
          {restaurants.length > 0 && (
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#fb923c', fontWeight: '700', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                Select Active Restaurant Preview:
              </label>
              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                {restaurants.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => setSelectedRest(r)}
                    style={{
                      padding: '0.5rem 1rem',
                      borderRadius: '9999px',
                      backgroundColor: selectedRest?.id === r.id ? '#f97316' : 'var(--btn-secondary-bg)',
                      color: selectedRest?.id === r.id ? '#ffffff' : 'var(--text-main)',
                      border: selectedRest?.id === r.id ? '1px solid #f97316' : '1px solid var(--border-glass)',
                      fontWeight: '700',
                      fontSize: '0.875rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      transition: 'all 0.2s',
                    }}
                  >
                    <Store size={14} /> {r.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div style={{
            background: '#ffffff',
            padding: '1.25rem 1.25rem 0.85rem 1.25rem',
            borderRadius: '24px',
            marginBottom: '1.25rem',
            display: 'inline-flex',
            flexDirection: 'column',
            alignItems: 'center',
            boxShadow: '0 15px 35px rgba(0,0,0,0.6)',
            border: '3px solid #f97316'
          }}>
            <QRCodeSVG
              value={qrUrl}
              size={180}
              level="H"
              includeMargin={true}
            />
            <span style={{ color: '#0f172a', fontSize: '0.85rem', fontWeight: 800, marginTop: '0.5rem' }}>
              {selectedRest ? selectedRest.name.toUpperCase() : 'GOURMET BISTRO'} - TABLE #{selectedTable}
            </span>
          </div>

          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-heading)', margin: 0 }}>
            Live Scannable Table QR Code
          </h2>
          <p style={{ fontSize: '0.9rem', color: '#38bdf8', marginTop: '0.35rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
            <Camera size={16} /> Scan code directly with Phone Camera or Google Lens!
          </p>
        </div>

        {/* Quick Table Selector */}
        <div style={{ width: '100%' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.75rem', fontWeight: 600, textAlign: 'center' }}>
            Select Table Number for {selectedRest ? selectedRest.name : 'Restaurant'}:
          </label>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: '0.75rem'
          }}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((tNum) => (
              <button
                key={tNum}
                onClick={() => setSelectedTable(tNum)}
                style={{
                  padding: '0.85rem 0.5rem',
                  borderRadius: '12px',
                  background: selectedTable === tNum ? 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)' : 'var(--bg-glass)',
                  color: selectedTable === tNum ? '#fff' : 'var(--text-main)',
                  border: selectedTable === tNum ? '1px solid #f97316' : '1px solid var(--border-glass)',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.3rem',
                  transition: 'all 0.2s ease',
                  boxShadow: selectedTable === tNum ? '0 4px 15px rgba(249, 115, 22, 0.4)' : 'none'
                }}
              >
                <Table size={18} />
                Table #{tNum}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleStartSession}
          disabled={loading}
          className="btn-primary"
          style={{ width: '100%', justifyContent: 'center', padding: '1rem', fontSize: '1.1rem', background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)' }}
        >
          {loading ? 'Entering Table Session...' : (
            <>
              Enter {selectedRest ? selectedRest.name : ''} Table #{selectedTable} Portal <ArrowRight size={20} />
            </>
          )}
        </button>
      </div>

      {/* Direct Portal Navigation Hub */}
      <div style={{ width: '100%', maxWidth: '1100px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <span style={{ fontSize: '0.85rem', color: '#38bdf8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            System Access Portals
          </span>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-heading)', marginTop: '0.35rem' }}>
            Explore All Platform Interfaces
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '0.25rem' }}>
            Seamlessly switch between guest dining and authenticated restaurant operations
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1.25rem'
        }}>
          {/* Customer Table */}
          <div
            onClick={handleStartSession}
            className="glass-panel"
            style={{
              padding: '1.5rem',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.8rem',
              transition: 'all 0.2s',
              border: '1px solid rgba(16, 185, 129, 0.3)'
            }}
          >
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: 'rgba(16, 185, 129, 0.15)',
              color: '#34d399',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Utensils size={22} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-heading)', margin: 0 }}>Customer Dining</h3>
              <span className="badge badge-placed" style={{ fontSize: '0.7rem' }}>Guest / QR</span>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
              Browse menu, filter veg/non-veg, customize dish spice, and pay invoice receipt.
            </p>
            <span style={{ fontSize: '0.85rem', color: '#34d399', fontWeight: 700, marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              Launch Table Menu <ArrowRight size={15} />
            </span>
          </div>

          {/* Kitchen Display */}
          <div
            onClick={() => navigate('/kitchen')}
            className="glass-panel"
            style={{
              padding: '1.5rem',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.8rem',
              transition: 'all 0.2s',
              border: '1px solid rgba(6, 182, 212, 0.3)'
            }}
          >
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: 'rgba(6, 182, 212, 0.15)',
              color: '#38bdf8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <ChefHat size={22} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-heading)', margin: 0 }}>Kitchen KDS</h3>
              <span className="badge badge-preparing" style={{ fontSize: '0.7rem' }}>Chef Role</span>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
              Real-time ticket queue, elapsed prep timers, and status advance workflow.
            </p>
            <span style={{ fontSize: '0.85rem', color: '#38bdf8', fontWeight: 700, marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              Open Kitchen Display <ArrowRight size={15} />
            </span>
          </div>

          {/* Waiter Portal */}
          <div
            onClick={() => navigate('/waiter')}
            className="glass-panel"
            style={{
              padding: '1.5rem',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.8rem',
              transition: 'all 0.2s',
              border: '1px solid rgba(245, 158, 11, 0.3)'
            }}
          >
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: 'rgba(245, 158, 11, 0.15)',
              color: '#fbbf24',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <ConciergeBell size={22} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-heading)', margin: 0 }}>Waiter Dispatch</h3>
              <span className="badge badge-ready" style={{ fontSize: '0.7rem' }}>Staff Role</span>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
              Ready dish pickup pass, customer assistance calls, and table liberation.
            </p>
            <span style={{ fontSize: '0.85rem', color: '#fbbf24', fontWeight: 700, marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              Open Waiter Portal <ArrowRight size={15} />
            </span>
          </div>

          {/* Manager Dashboard */}
          <div
            onClick={() => navigate('/manager')}
            className="glass-panel"
            style={{
              padding: '1.5rem',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.8rem',
              transition: 'all 0.2s',
              border: '1px solid rgba(99, 102, 241, 0.3)'
            }}
          >
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: 'rgba(99, 102, 241, 0.15)',
              color: '#818cf8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <LayoutDashboard size={22} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-heading)', margin: 0 }}>Manager Portal</h3>
              <span className="badge badge-served" style={{ fontSize: '0.7rem' }}>Admin Role</span>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
              Executive revenue analytics, menu dish catalog, table QR generator, and receipts.
            </p>
            <span style={{ fontSize: '0.85rem', color: '#818cf8', fontWeight: 700, marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              Open Manager Portal <ArrowRight size={15} />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
