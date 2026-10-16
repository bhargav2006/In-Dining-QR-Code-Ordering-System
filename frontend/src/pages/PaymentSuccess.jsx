import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { CheckCircle2, Printer, Home, Bell, Sparkles, Heart, UtensilsCrossed } from 'lucide-react';
import { customerApi } from '../services/api';
import { useToast } from '../context/ToastContext';

export default function PaymentSuccess() {
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const { tableNumber: paramTable } = useParams();

  const [receipt, setReceipt] = useState(() => {
    if (location.state && location.state.receipt) {
      return location.state.receipt;
    }
    const saved = sessionStorage.getItem('lastCompletedReceipt');
    return saved ? JSON.parse(saved) : null;
  });

  const [loading, setLoading] = useState(!receipt);
  const [assistanceSent, setAssistanceSent] = useState(false);

  const tNum = receipt?.tableNumber || paramTable || '1';

  useEffect(() => {
    if (receipt) {
      sessionStorage.setItem('lastCompletedReceipt', JSON.stringify(receipt));
    } else {
      // Attempt to load from active session token if present
      const savedSession = sessionStorage.getItem('currentSession');
      if (savedSession) {
        try {
          const sessObj = JSON.parse(savedSession);
          if (sessObj.sessionToken) {
            customerApi.getBillReceipt(sessObj.sessionToken).then((data) => {
              if (data && data.isPaid) {
                setReceipt(data);
                sessionStorage.setItem('lastCompletedReceipt', JSON.stringify(data));
              }
            }).catch(console.error).finally(() => setLoading(false));
            return;
          }
        } catch (e) {
          console.error(e);
        }
      }
      setLoading(false);
    }
  }, [receipt]);

  const handlePrint = () => {
    window.print();
  };

  const handleFinish = () => {
    sessionStorage.removeItem('currentSession');
    sessionStorage.removeItem('lastCompletedReceipt');
    localStorage.removeItem(`customer_session_tbl_${tNum}`);
    localStorage.removeItem(`customer_token_tbl_${tNum}`);
    navigate(`/table/${tNum}`);
  };

  const handleRequestAssistance = async () => {
    const savedSession = sessionStorage.getItem('currentSession');
    if (savedSession) {
      try {
        const sessObj = JSON.parse(savedSession);
        await customerApi.requestAssistance(sessObj.sessionToken, 'OTHER', 'Customer requested help at checkout page');
        setAssistanceSent(true);
        toast.success('Floor waiter notified for Table #' + tNum);
        setTimeout(() => setAssistanceSent(false), 5000);
      } catch (err) {
        toast.error('Could not notify waiter: ' + err.message);
      }
    } else {
      toast.info('Waiter notified for Table #' + tNum);
    }
  };

  if (loading) {
    return (
      <div style={{ maxWidth: '600px', margin: '4rem auto', padding: '1rem', textAlign: 'center' }}>
        <div className="glass-panel" style={{ padding: '3rem' }}>
          <div className="animate-spin" style={{ display: 'inline-block', marginBottom: '1rem' }}>
            <UtensilsCrossed size={40} style={{ color: '#10b981' }} />
          </div>
          <p style={{ color: 'var(--text-muted)' }}>Loading digital tax invoice...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '720px', margin: '2rem auto', padding: '1rem' }}>
      {/* Success Celebration Card */}
      <div
        className="glass-panel animate-pop-in"
        style={{
          padding: '2.5rem 2rem',
          textAlign: 'center',
          marginBottom: '2rem',
          position: 'relative',
          overflow: 'hidden',
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(6, 182, 212, 0.1) 100%)',
          border: '1px solid rgba(16, 185, 129, 0.4)'
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '-20px',
            right: '-20px',
            opacity: 0.1,
            pointerEvents: 'none'
          }}
        >
          <Sparkles size={160} color="#10b981" />
        </div>

        <div
          style={{
            display: 'inline-flex',
            padding: '1.2rem',
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            color: '#fff',
            borderRadius: '50%',
            marginBottom: '1.2rem',
            boxShadow: '0 0 30px rgba(16, 185, 129, 0.5)'
          }}
        >
          <CheckCircle2 size={54} />
        </div>

        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#fff', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
          Payment Successful! 🎉
        </h1>

        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#34d399', marginBottom: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
          Thank You for Dining with Us! <Heart size={18} fill="#f43f5e" color="#f43f5e" />
        </h3>

        <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', maxWidth: '500px', margin: '0 auto 1.5rem', lineHeight: 1.6 }}>
          We hope you had a wonderful culinary experience at <strong>Gourmet Restaurant</strong>. Your order is settled and your digital tax invoice receipt is generated below.
        </p>

        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem', padding: '0.5rem 1.2rem', background: 'rgba(255,255,255,0.1)', borderRadius: '999px', fontSize: '0.85rem', color: '#fff', fontWeight: 700 }}>
          <span>Table #{tNum}</span>
          <span>•</span>
          <span>Payment Mode: {receipt?.paymentMethod || 'CARD'}</span>
        </div>
      </div>

      {/* Printable Digital Tax Receipt Container */}
      <div
        id="printable-receipt"
        style={{
          background: '#ffffff',
          color: '#111827',
          padding: '2rem',
          borderRadius: '16px',
          fontFamily: "'Courier New', Courier, monospace",
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
          marginBottom: '2rem'
        }}
      >
        <div style={{ textAlign: 'center', borderBottom: '2px dashed #374151', paddingBottom: '1rem', marginBottom: '1.2rem' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 900, margin: 0, color: '#000', letterSpacing: '0.05em' }}>
            🍽️ GOURMET RESTAURANT
          </h2>
          <p style={{ fontSize: '0.8rem', color: '#4b5563', margin: '0.2rem 0' }}>123 Fine Dining Avenue, Food City</p>
          <p style={{ fontSize: '0.8rem', color: '#4b5563', margin: 0 }}>GSTIN: 22AAAAA0000A1Z5 | Tel: +1 (555) 019-FOOD</p>
          <div style={{ marginTop: '0.6rem', fontWeight: 700, fontSize: '0.9rem', color: '#000' }}>
            *** DIGITAL TAX INVOICE / RECEIPT ***
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '0.5rem', color: '#374151' }}>
          <span><strong>Receipt #:</strong> {receipt?.receiptNumber || ('REC-' + Math.floor(100000 + Math.random() * 900000))}</span>
          <span><strong>Table:</strong> #{tNum}</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '1rem', color: '#374151', borderBottom: '1px dashed #e5e7eb', paddingBottom: '0.5rem' }}>
          <span><strong>Date:</strong> {receipt?.createdAt ? new Date(receipt.createdAt).toLocaleString() : new Date().toLocaleString()}</span>
          <span><strong>Status:</strong> <span style={{ color: '#059669', fontWeight: 800 }}>PAID</span></span>
        </div>

        {receipt?.customerName && (
          <div style={{ fontSize: '0.82rem', color: '#374151', marginBottom: '0.8rem', paddingBottom: '0.5rem', borderBottom: '1px dashed #e5e7eb' }}>
            <strong>Customer:</strong> {receipt.customerName} {receipt.phoneNumber ? `(${receipt.phoneNumber})` : ''}
          </div>
        )}

        {/* Itemized Table */}
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '0.82rem', borderBottom: '1px solid #000', paddingBottom: '0.3rem', marginBottom: '0.5rem' }}>
            <span style={{ flex: 2 }}>ITEM DESCRIPTION</span>
            <span style={{ flex: 1, textAlign: 'center' }}>QTY</span>
            <span style={{ flex: 1, textAlign: 'right' }}>AMOUNT</span>
          </div>

          {receipt?.items && receipt.items.length > 0 ? (
            receipt.items.map((it, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.4rem' }}>
                <span style={{ flex: 2 }}>{it.dishName}</span>
                <span style={{ flex: 1, textAlign: 'center' }}>{it.quantity}</span>
                <span style={{ flex: 1, textAlign: 'right' }}>${(it.itemTotal || (it.price * it.quantity) || 0).toFixed(2)}</span>
              </div>
            ))
          ) : (
            <div style={{ fontSize: '0.85rem', color: '#6b7280', fontStyle: 'italic', margin: '0.5rem 0' }}>
              Standard dining experience items included
            </div>
          )}
        </div>

        {/* Totals */}
        <div style={{ borderTop: '2px dashed #374151', paddingTop: '0.6rem', marginTop: '0.8rem', fontSize: '0.85rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
            <span>Subtotal</span>
            <span>${(receipt?.subtotal || 0).toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
            <span>CGST + SGST (5%)</span>
            <span>${(receipt?.taxAmount || 0).toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 900, fontSize: '1.1rem', marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '2px solid #000', color: '#000' }}>
            <span>TOTAL PAID</span>
            <span>${(receipt?.totalAmount || 0).toFixed(2)}</span>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '1.2rem', paddingTop: '0.8rem', borderTop: '1px dashed #374151', fontSize: '0.78rem', color: '#4b5563' }}>
          <div>Payment Method: <strong>{receipt?.paymentMethod || 'CARD'}</strong></div>
          {receipt?.rating && (
            <div style={{ marginTop: '0.2rem' }}>
              Customer Rating: {'★'.repeat(receipt.rating)}{'☆'.repeat(5 - receipt.rating)}
            </div>
          )}
          <div style={{ marginTop: '0.6rem', fontWeight: 700, color: '#111827' }}>
            Thanks for coming! We hope to see you again soon! ❤️
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center' }}>
        <button
          onClick={handlePrint}
          className="btn-primary"
          style={{ padding: '0.9rem 1.8rem', fontSize: '1rem', cursor: 'pointer' }}
        >
          <Printer size={18} /> Print / Save Tax Receipt
        </button>

        <button
          onClick={handleRequestAssistance}
          className="btn-secondary"
          style={{ padding: '0.9rem 1.4rem', fontSize: '0.95rem', cursor: 'pointer' }}
        >
          <Bell size={18} style={{ color: '#fbbf24' }} /> {assistanceSent ? 'Waiter Notified!' : 'Need Waiter Assistance'}
        </button>

        <button
          onClick={handleFinish}
          className="btn-secondary"
          style={{ padding: '0.9rem 1.4rem', fontSize: '0.95rem', background: 'rgba(255,255,255,0.15)', cursor: 'pointer' }}
        >
          <Home size={18} /> Back to Table Home
        </button>
      </div>
    </div>
  );
}
