import React, { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import CircularLogo from '../ui/CircularLogo';

export default function TableQRModal({
  isOpen,
  onClose,
  table = null,
  restaurantName = 'Tasty Tacos',
  restaurantSlug = 'tasty-tacos',
}) {
  const printAreaRef = useRef(null);

  if (!isOpen || !table) return null;

  // Exact verified customer route using the unique qrToken or tableNumber
  const customerQrUrl = `${window.location.origin}/qr/${table.qrToken || `TBL-${table.tableNumber}`}`;
  const customerDirectUrl = `${window.location.origin}/r/${restaurantSlug}/table/${table.tableNumber}`;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(customerQrUrl);
    alert('Customer QR URL copied to clipboard!');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Table ${table.tableNumber} Dining QR Badge`}
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
        {/* Printable Standee Card */}
        <div
          ref={printAreaRef}
          className="printable-qr-standee"
          style={{
            width: '100%',
            maxWidth: '320px',
            background: '#ffffff',
            color: '#0E1111',
            borderRadius: '16px',
            padding: '24px 20px',
            textAlign: 'center',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)',
            border: '2px solid #e5e7eb',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          {/* Brand Header */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
            <CircularLogo size={48} />
            <span style={{ fontSize: '1rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#111827' }}>
              {restaurantName}
            </span>
          </div>

          {/* Table Prominence Badge */}
          <div
            style={{
              padding: '6px 18px',
              borderRadius: '9999px',
              background: '#10b981',
              color: '#ffffff',
              fontSize: '1.2rem',
              fontWeight: 800,
              letterSpacing: '-0.01em',
            }}
          >
            TABLE {table.tableNumber}
          </div>

          <p style={{ margin: 0, fontSize: '0.8rem', color: '#4b5563', fontWeight: 600 }}>
            Scan with your smartphone camera to order & pay
          </p>

          {/* High-Contrast SVG QR Code */}
          <div
            style={{
              padding: '12px',
              background: '#ffffff',
              borderRadius: '12px',
              border: '1px solid #e5e7eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <QRCodeSVG
              value={customerQrUrl}
              size={180}
              level="H"
              includeMargin={false}
            />
          </div>

          {/* QR Token & Capacity */}
          <div style={{ fontSize: '0.7rem', color: '#6b7280', fontFamily: 'monospace' }}>
            <div>TOKEN: {table.qrToken || `TBL-${table.tableNumber}`}</div>
            <div>SEATS: {table.capacity} Guests</div>
          </div>
        </div>

        {/* Customer Route URL & Copy Action */}
        <div
          style={{
            width: '100%',
            background: 'var(--color-surface-sunken)',
            padding: '10px 12px',
            borderRadius: 'var(--radius-md, 8px)',
            fontSize: '0.75rem',
            color: 'var(--color-text-muted)',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            boxSizing: 'border-box',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 700, color: 'var(--color-text)' }}>CUSTOMER QR TARGET:</span>
            <button
              onClick={handleCopyLink}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--color-primary, #10b981)',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              📋 Copy Link
            </button>
          </div>
          <div
            style={{
              fontFamily: 'var(--gds-font-mono, monospace)',
              wordBreak: 'break-all',
              color: 'var(--color-text)',
            }}
          >
            {customerQrUrl}
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '10px', width: '100%', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>

          <a
            href={customerDirectUrl}
            target="_blank"
            rel="noreferrer"
            style={{ textDecoration: 'none' }}
          >
            <Button variant="outline" size="sm">
              🔗 Test Customer Flow ↗
            </Button>
          </a>

          <Button variant="primary" size="sm" onClick={handlePrint}>
            🖨️ Print QR Standee
          </Button>
        </div>
      </div>
    </Modal>
  );
}

