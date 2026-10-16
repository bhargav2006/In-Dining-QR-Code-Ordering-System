import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../services/api';

export default function QRScannerModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestSlug, setSelectedRestSlug] = useState('');
  const [tableNum, setTableNum] = useState(1);
  const [manualCode, setManualCode] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanMessage, setScanMessage] = useState('');
  const videoRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      authApi.getRestaurants().then((data) => {
        if (data && data.length > 0) {
          const filtered = data.filter(r => r.name?.toLowerCase() !== 'restaurant 1' && r.slug !== 'restaurant-1');
          setRestaurants(filtered);
          const fineDiner = filtered.find(r => r.slug === 'fine-diner' || r.name?.toLowerCase().includes('fine diner'));
          setSelectedRestSlug(fineDiner ? fineDiner.slug : filtered[0]?.slug || '');
        }
      }).catch(() => {});
    }
  }, [isOpen]);

  const startWebcam = async () => {
    try {
      setIsScanning(true);
      setScanMessage('Requesting camera access...');
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setScanMessage('Camera active! Point at a table QR code...');
      }
    } catch (err) {
      setScanMessage('Camera access denied or unavailable. Use quick table launcher below.');
      setIsScanning(false);
    }
  };

  const stopWebcam = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject;
      const tracks = stream.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsScanning(false);
  };

  const handleClose = () => {
    stopWebcam();
    onClose();
  };

  const handleLaunchTable = () => {
    handleClose();
    if (selectedRestSlug) {
      navigate(`/r/${selectedRestSlug}/table/${tableNum}`);
    } else {
      navigate(`/table/${tableNum}`);
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!manualCode) return;
    handleClose();
    // Parse token or slug format if typed e.g. /r/slug/table/1
    if (manualCode.includes('/r/')) {
      navigate(manualCode);
    } else {
      navigate(`/table/${manualCode}`);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.8)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1100,
      padding: '1rem',
      animation: 'fadeIn 0.2s ease-out',
    }}>
      <div
        className="glass-panel-elevated"
        style={{
          borderRadius: '1.25rem',
          maxWidth: '520px',
          width: '100%',
          padding: '1.75rem',
          position: 'relative',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '0.75rem',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.3rem',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
            }}>
              📷
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: '800', color: 'var(--text-heading)' }}>QR Code Scanner</h3>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>Scan table QR code to start ordering</p>
            </div>
          </div>

          <button
            onClick={handleClose}
            style={{
              background: 'var(--bg-glass)',
              border: '1px solid var(--border-glass)',
              color: 'var(--text-muted)',
              fontSize: '1.2rem',
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ✕
          </button>
        </div>

        {/* Live Camera Viewport */}
        <div style={{
          position: 'relative',
          width: '100%',
          height: '240px',
          backgroundColor: 'var(--bg-card)',
          borderRadius: '1rem',
          overflow: 'hidden',
          border: '2px dashed var(--border-glass)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1.25rem',
        }}>
          <video
            ref={videoRef}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: isScanning ? 'block' : 'none',
            }}
          />

          {!isScanning ? (
            <div style={{ textAlign: 'center', padding: '1rem' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📷</div>
              <p style={{ margin: '0 0 0.75rem 0', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                Use device camera to scan Table QR Code
              </p>
              <button
                onClick={startWebcam}
                style={{
                  padding: '0.5rem 1.25rem',
                  borderRadius: '0.5rem',
                  backgroundColor: '#10b981',
                  color: '#fff',
                  fontWeight: '600',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                }}
              >
                Enable Camera Scanner
              </button>
            </div>
          ) : (
            <div style={{
              position: 'absolute',
              bottom: '10px',
              left: '10px',
              right: '10px',
              backgroundColor: 'rgba(15, 23, 42, 0.85)',
              color: '#10b981',
              padding: '0.4rem 0.75rem',
              borderRadius: '0.5rem',
              fontSize: '0.8rem',
              textAlign: 'center',
              fontWeight: '600',
            }}>
              {scanMessage}
            </div>
          )}
        </div>

        {/* Quick Restaurant & Table Launcher */}
        <div style={{
          backgroundColor: 'var(--bg-glass)',
          padding: '1rem',
          borderRadius: '0.85rem',
          border: '1px solid var(--border-glass)',
          marginBottom: '1rem',
        }}>
          <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#fb923c', textTransform: 'uppercase', marginBottom: '0.75rem', letterSpacing: '0.05em' }}>
            ⚡ Direct Table Selector
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Select Restaurant</label>
              <select
                value={selectedRestSlug}
                onChange={(e) => setSelectedRestSlug(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  borderRadius: '0.5rem',
                  backgroundColor: 'var(--input-bg)',
                  border: '1px solid var(--input-border)',
                  color: 'var(--text-main)',
                  fontSize: '0.85rem',
                  outline: 'none',
                }}
              >
                {restaurants.map((r) => (
                  <option key={r.id} value={r.slug}>{r.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Table #</label>
              <input
                type="number"
                min="1"
                max="50"
                value={tableNum}
                onChange={(e) => setTableNum(parseInt(e.target.value) || 1)}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  borderRadius: '0.5rem',
                  backgroundColor: 'var(--input-bg)',
                  border: '1px solid var(--input-border)',
                  color: 'var(--text-main)',
                  fontSize: '0.85rem',
                  outline: 'none',
                }}
              />
            </div>
          </div>

          <button
            onClick={handleLaunchTable}
            style={{
              width: '100%',
              padding: '0.65rem',
              borderRadius: '0.5rem',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: '#fff',
              fontWeight: '700',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.9rem',
            }}
          >
            Enter Table #{tableNum} Menu 🍽️
          </button>
        </div>

        {/* Manual Code / Token Entry */}
        <form onSubmit={handleManualSubmit} style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            type="text"
            placeholder="Or enter table # or token (e.g. 1)"
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value)}
            style={{
              flex: 1,
              padding: '0.5rem 0.75rem',
              borderRadius: '0.5rem',
              backgroundColor: 'var(--input-bg)',
              border: '1px solid var(--input-border)',
              color: 'var(--text-main)',
              fontSize: '0.85rem',
              outline: 'none',
            }}
          />
          <button
            type="submit"
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '0.5rem',
              backgroundColor: 'var(--btn-secondary-bg)',
              color: 'var(--text-main)',
              border: '1px solid var(--border-glass)',
              fontWeight: '600',
              cursor: 'pointer',
              fontSize: '0.85rem',
            }}
          >
            Go
          </button>
        </form>
      </div>
    </div>
  );
}
