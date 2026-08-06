import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { QrCode, Sparkles, ArrowRight, Table, Smartphone, Camera } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { customerApi } from '../services/api';
import { getFrontendUrl } from '../utils/url';

export default function LandingPage() {
  const [selectedTable, setSelectedTable] = useState(1);
  const [qrToken, setQrToken] = useState('QR-TBL-1-TOKEN');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleStartSession = async (tableNum, token) => {
    setLoading(true);
    try {
      const data = await customerApi.startSession(tableNum, token);
      sessionStorage.setItem('currentSession', JSON.stringify(data));
      navigate(`/table/${data.tableNumber}`);
    } catch (err) {
      alert('Error starting table session: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '3rem 1.5rem',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '3rem'
    }}>
      {/* Hero Header */}
      <div className="animate-fade-in" style={{ textAlign: 'center', maxWidth: '750px' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.4rem 1rem',
          background: 'rgba(16, 185, 129, 0.12)',
          color: '#10b981',
          borderRadius: '9999px',
          fontSize: '0.85rem',
          fontWeight: 700,
          marginBottom: '1rem',
          border: '1px solid rgba(16, 185, 129, 0.3)'
        }}>
          <Sparkles size={16} /> NEXT-GEN IN-DINING EXPERIENCE
        </div>
        <h1 style={{
          fontSize: '3rem',
          fontWeight: 800,
          lineHeight: 1.1,
          color: '#fff',
          marginBottom: '1.2rem',
          letterSpacing: '-0.03em'
        }}>
          Scan, Order & Enjoy <br />
          <span style={{
            background: 'linear-gradient(135deg, #10b981 0%, #38bdf8 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Right From Your Table
          </span>
        </h1>
        <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
          No waiting for physical menus. Scan the QR code on your table to browse gourmet dishes, customize options, place instant orders, and call table service seamlessly.
        </p>
      </div>

      {/* Interactive QR Simulator & Table Picker */}
      <div className="glass-panel animate-fade-in" style={{
        maxWidth: '650px',
        width: '100%',
        padding: '2.5rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '2rem'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            background: '#ffffff',
            padding: '1.2rem 1.2rem 0.8rem 1.2rem',
            borderRadius: '20px',
            marginBottom: '1rem',
            display: 'inline-flex',
            flexDirection: 'column',
            alignItems: 'center',
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
            border: '2px solid rgba(16, 185, 129, 0.5)'
          }}>
            <QRCodeSVG
              value={`${getFrontendUrl()}/table/${selectedTable}`}
              size={170}
              level="H"
              includeMargin={true}
            />
            <span style={{ color: '#0f172a', fontSize: '0.8rem', fontWeight: 800, marginTop: '0.4rem' }}>
              TABLE #{selectedTable} QR CODE
            </span>
          </div>

          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#fff' }}>
            Live Scannable Table QR Code
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#38bdf8', marginTop: '0.3rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
            <Camera size={16} /> Scan directly with Phone Camera or Google Lens!
          </p>
        </div>

        {/* Quick Table Buttons (Tables 1 - 10) */}
        <div style={{ width: '100%' }}>
          <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem', fontWeight: 600, textAlign: 'center' }}>
            Choose Dining Table Number:
          </label>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: '0.75rem'
          }}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((tNum) => (
              <button
                key={tNum}
                onClick={() => {
                  setSelectedTable(tNum);
                  setQrToken(`QR-TBL-${tNum}-TOKEN`);
                }}
                style={{
                  padding: '1rem 0.5rem',
                  borderRadius: '12px',
                  background: selectedTable === tNum ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'rgba(255, 255, 255, 0.05)',
                  color: selectedTable === tNum ? '#fff' : 'var(--text-main)',
                  border: selectedTable === tNum ? '1px solid #10b981' : '1px solid var(--border-glass)',
                  fontWeight: 700,
                  fontSize: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.3rem',
                  transition: 'all 0.2s ease',
                  boxShadow: selectedTable === tNum ? '0 4px 15px rgba(16, 185, 129, 0.4)' : 'none'
                }}
              >
                <Table size={18} />
                Table #{tNum}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => handleStartSession(selectedTable, qrToken)}
          disabled={loading}
          className="btn-primary"
          style={{ width: '100%', justifyContent: 'center', padding: '1rem', fontSize: '1.1rem' }}
        >
          {loading ? 'Initializing Session...' : (
            <>
              Enter Table #{selectedTable} Menu Portal <ArrowRight size={20} />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
