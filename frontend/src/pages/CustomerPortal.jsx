import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Search, ShoppingBag, Plus, Minus, Bell, CheckCircle2, Clock, Utensils, X, Flame, AlertCircle, CreditCard, Star, PhoneCall, Printer, DollarSign, QrCode, Lock, RefreshCw } from 'lucide-react';
import { customerApi } from '../services/api';

export default function CustomerPortal() {
  const { tableNumber } = useParams();
  const navigate = useNavigate();
  const tNum = parseInt(tableNumber || '1', 10);

  const [session, setSession] = useState(null);
  const [isOccupiedLocked, setIsOccupiedLocked] = useState(false);
  const [manualSessionToken, setManualSessionToken] = useState('');

  const [categories, setCategories] = useState([]);
  const [dishes, setDishes] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [dietaryFilter, setDietaryFilter] = useState('ALL'); // 'ALL', 'VEG', 'NON_VEG'
  
  // Cart state
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  // Selected dish for customization modal
  const [customizingDish, setCustomizingDish] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [specialInstructions, setSpecialInstructions] = useState('');
  
  // Active Orders tracking
  const [myOrders, setMyOrders] = useState([]);
  const [isOrdersOpen, setIsOrdersOpen] = useState(false);

  // Assistance modal
  const [isAssistanceOpen, setIsAssistanceOpen] = useState(false);
  const [assistanceType, setAssistanceType] = useState('WATER');
  const [assistanceNote, setAssistanceNote] = useState('');
  const [assistanceSuccess, setAssistanceSuccess] = useState(false);

  // Loading states for debouncing / preventing double-submission on lag
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [isSendingAssistance, setIsSendingAssistance] = useState(false);

  // Pay Bill & Review State
  const [isPayBillOpen, setIsPayBillOpen] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [rating, setRating] = useState(5);
  const [reviewComments, setReviewComments] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('CARD'); // CARD, UPI_QR, CASH
  const [cashRequested, setCashRequested] = useState(false);
  const [completedReceipt, setCompletedReceipt] = useState(null);
  const [loadingPayment, setLoadingPayment] = useState(false);

  // Load session & menu data
  useEffect(() => {
    async function init() {
      // Check sessionStorage first, then fallback to persistent localStorage for this device & table
      let stored = sessionStorage.getItem('currentSession') || localStorage.getItem(`customer_session_tbl_${tNum}`);
      let sessData = stored ? JSON.parse(stored) : null;
      let activeToken = (sessData && sessData.tableNumber === tNum) ? sessData.sessionToken : null;

      if (!activeToken) {
        activeToken = localStorage.getItem(`customer_token_tbl_${tNum}`) || null;
      }

      try {
        const resultSess = await customerApi.startSession(tNum, `QR-TBL-${tNum}-TOKEN`, activeToken);

        if (resultSess?.isOccupiedLocked) {
          // Backend rejected token as invalid/expired. Purge stale tokens from device storage!
          localStorage.removeItem(`customer_session_tbl_${tNum}`);
          localStorage.removeItem(`customer_token_tbl_${tNum}`);
          sessionStorage.removeItem('currentSession');

          setIsOccupiedLocked(true);
          setSession(resultSess);
          return;
        }

        setIsOccupiedLocked(false);
        setSession(resultSess);
        if (resultSess?.sessionToken) {
          sessionStorage.setItem('currentSession', JSON.stringify(resultSess));
          localStorage.setItem(`customer_session_tbl_${tNum}`, JSON.stringify(resultSess));
          localStorage.setItem(`customer_token_tbl_${tNum}`, resultSess.sessionToken);
        }

        const catData = await customerApi.getCategories();
        setCategories(catData);

        const dishData = await customerApi.getMenu(null, '');
        setDishes(dishData);

        if (resultSess?.sessionToken) {
          const orders = await customerApi.getSessionOrders(resultSess.sessionToken);
          setMyOrders(orders);

          try {
            const rec = await customerApi.getBillReceipt(resultSess.sessionToken);
            if (rec && rec.isPaid) {
              setCompletedReceipt(rec);
            }
          } catch (e) {}
        }
      } catch (e) {
        console.error('Session init error:', e);
      }
    }
    init();
  }, [tNum]);

  // Expose DevTools Console command to view active Session Token cleanly
  useEffect(() => {
    if (session?.sessionToken) {
      window.getSessionToken = () => {
        console.log('%c🔑 ACTIVE TABLE SESSION DETAILS', 'color: #10b981; font-weight: bold; font-size: 14px;');
        console.log(`Table Number : #${tNum}`);
        console.log(`Session Token: ${session.sessionToken}`);
        console.log(`Status       : ACTIVE`);
        return session.sessionToken;
      };
      window.logToken = window.getSessionToken;
    }
  }, [session, tNum]);

  const handleConnectSession = async (customToken = null) => {
    const tokenToUse = typeof customToken === 'string' ? customToken : manualSessionToken;
    if (!tokenToUse) return;
    try {
      const resultSess = await customerApi.startSession(tNum, `QR-TBL-${tNum}-TOKEN`, tokenToUse.trim());
      if (resultSess?.isOccupiedLocked) {
        localStorage.removeItem(`customer_session_tbl_${tNum}`);
        localStorage.removeItem(`customer_token_tbl_${tNum}`);
        sessionStorage.removeItem('currentSession');
        alert('Invalid session token for Table #' + tNum);
        return;
      }

      setIsOccupiedLocked(false);
      setSession(resultSess);
      sessionStorage.setItem('currentSession', JSON.stringify(resultSess));
      localStorage.setItem(`customer_session_tbl_${tNum}`, JSON.stringify(resultSess));
      localStorage.setItem(`customer_token_tbl_${tNum}`, resultSess.sessionToken);
      window.location.reload();
    } catch (e) {
      alert('Error connecting to session: ' + e.message);
    }
  };

  // Polling active orders status every 5s
  useEffect(() => {
    if (!session?.sessionToken) return;
    const pollMs = Number(import.meta.env.VITE_POLLING_INTERVAL_MS) || 5000;
    const interval = setInterval(async () => {
      const orders = await customerApi.getSessionOrders(session.sessionToken);
      setMyOrders(orders);
    }, pollMs);
    return () => clearInterval(interval);
  }, [session]);

  // Zero-Touch Auto-Polling for Cash Payment Resolution:
  // When waiter attends & completes cash payment, customer UI automatically updates & redirects to success page!
  useEffect(() => {
    if (!cashRequested || !session?.sessionToken) return;
    const interval = setInterval(async () => {
      try {
        const receipt = await customerApi.getBillReceipt(session.sessionToken);
        if (receipt && receipt.isPaid) {
          setCompletedReceipt(receipt);
          setCashRequested(false);
          sessionStorage.setItem('lastCompletedReceipt', JSON.stringify(receipt));
          navigate(`/table/${tNum}/success`, { state: { receipt } });
        }
      } catch (e) {
        console.error('Error polling cash receipt status:', e);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [cashRequested, session, navigate, tNum]);

  const handleCancelOrder = async (orderId) => {
    if (!session) return;
    if (!window.confirm('Are you sure you want to cancel this uncooked order?')) return;

    try {
      await customerApi.cancelOrder(orderId, session.sessionToken);
      const updatedOrders = await customerApi.getSessionOrders(session.sessionToken);
      setMyOrders(updatedOrders);
    } catch (err) {
      alert('Failed to cancel order: ' + err.message);
    }
  };

  const checkIsVeg = (dish) => {
    if (typeof dish.isVeg === 'boolean') return dish.isVeg;
    const lower = (dish.name + ' ' + (dish.description || '')).toLowerCase();
    const nonVegKeywords = ['chicken', 'prawn', 'salmon', 'burger', 'steak', 'beef', 'meat', 'fish', 'pork', 'bacon', 'lamb', 'mutton', 'seafood'];
    return !nonVegKeywords.some(kw => lower.includes(kw));
  };

  const filteredDishes = dishes.filter(dish => {
    const matchesCat = !selectedCategory || dish.category?.id === selectedCategory;
    const matchesSearch = !searchQuery || dish.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    const isVeg = checkIsVeg(dish);
    let matchesDiet = true;
    if (dietaryFilter === 'VEG') matchesDiet = isVeg;
    if (dietaryFilter === 'NON_VEG') matchesDiet = !isVeg;

    return matchesCat && matchesSearch && matchesDiet;
  });

  const openCustomization = (dish) => {
    setCustomizingDish(dish);
    setQuantity(1);
    setSelectedOptions([]);
    setSpecialInstructions('');
  };

  const handleAddToCart = () => {
    if (!customizingDish) return;
    
    const existingIndex = cart.findIndex(c => 
      c.dish.id === customizingDish.id && c.specialInstructions === specialInstructions
    );

    if (existingIndex > -1) {
      const updated = [...cart];
      updated[existingIndex].quantity += quantity;
      setCart(updated);
    } else {
      setCart([...cart, {
        dish: customizingDish,
        quantity,
        options: selectedOptions,
        specialInstructions
      }]);
    }

    setCustomizingDish(null);
  };

  const subtotal = cart.reduce((acc, item) => acc + item.dish.price * item.quantity, 0);
  const tax = +(subtotal * 0.05).toFixed(2);
  const grandTotal = +(subtotal + tax).toFixed(2);

  const handlePlaceOrder = async () => {
    if (isPlacingOrder || cart.length === 0 || !session) return;
    setIsPlacingOrder(true);

    try {
      const cartItems = cart.map(item => ({
        dishId: item.dish.id,
        quantity: item.quantity,
        specialInstructions: [
          ...item.options,
          item.specialInstructions
        ].filter(Boolean).join(', ')
      }));

      const newOrder = await customerApi.createOrder(session.sessionToken, cartItems, 'Customer online order');
      setMyOrders([newOrder, ...myOrders]);
      setCart([]);
      setIsCartOpen(false);
      setIsOrdersOpen(true);
    } catch (err) {
      alert('Failed to place order: ' + err.message);
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const handleSendAssistance = async () => {
    if (isSendingAssistance || !session) return;
    setIsSendingAssistance(true);
    try {
      await customerApi.requestAssistance(session.sessionToken, assistanceType, assistanceNote);
      setAssistanceSuccess(true);
      setTimeout(() => {
        setAssistanceSuccess(false);
        setIsAssistanceOpen(false);
      }, 2000);
    } catch (err) {
      alert('Failed to request assistance: ' + err.message);
    } finally {
      setIsSendingAssistance(false);
    }
  };

  // Submit Payment / Generate Digital Receipt
  const handleProcessPayment = async () => {
    if (!session) return;
    if (!myOrders || myOrders.length === 0) {
      alert('Cannot process payment: Your order history is empty! Please place an order first.');
      return;
    }
    setLoadingPayment(true);

    try {
      const paymentData = {
        sessionToken: session.sessionToken,
        customerName,
        phoneNumber: customerPhone,
        email: customerEmail,
        rating,
        reviewComments,
        paymentMethod,
        assignedWaiterMobile: '+1 (555) 019-WAIT'
      };

      const resultReceipt = await customerApi.processPayment(paymentData);
      setCompletedReceipt(resultReceipt);
      sessionStorage.setItem('lastCompletedReceipt', JSON.stringify(resultReceipt));

      if (paymentMethod === 'CASH') {
        setCashRequested(true);
      } else {
        setIsPayBillOpen(false);
        navigate(`/table/${tNum}/success`, { state: { receipt: resultReceipt } });
      }
    } catch (err) {
      alert('Payment processing error: ' + err.message);
    } finally {
      setLoadingPayment(false);
    }
  };

  if (isOccupiedLocked) {
    return (
      <div style={{ maxWidth: '600px', margin: '4rem auto', padding: '1rem' }}>
        <div className="glass-panel animate-fade-in" style={{ padding: '2.5rem 2rem', textAlign: 'center' }}>
          <div style={{
            display: 'inline-flex',
            padding: '1.2rem',
            background: 'rgba(244, 63, 94, 0.15)',
            color: '#f87171',
            borderRadius: '20px',
            marginBottom: '1.2rem',
            border: '1px solid rgba(244, 63, 94, 0.3)'
          }}>
            <Lock size={48} />
          </div>

          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', marginBottom: '0.6rem' }}>
            Table #{tNum} is Currently Occupied
          </h2>

          <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '2rem' }}>
            This dining table has an active order session in progress by another group of diners.
            If you are dining together with this table party, enter the Session Code below or ask your table host for access.
          </p>

          {localStorage.getItem(`customer_token_tbl_${tNum}`) && (
            <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.4)', padding: '1rem', borderRadius: '14px', marginBottom: '1.5rem' }}>
              <span style={{ fontSize: '0.85rem', color: '#34d399', fontWeight: 700, display: 'block', marginBottom: '0.5rem' }}>
                Saved Session Found on This Device!
              </span>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.8rem' }}>
                Token: <strong>{localStorage.getItem(`customer_token_tbl_${tNum}`)}</strong>
              </p>
              <button
                onClick={() => handleConnectSession(localStorage.getItem(`customer_token_tbl_${tNum}`))}
                className="btn-primary"
                style={{ width: '100%', justifyContent: 'center' }}
              >
                ⚡ Auto-Reconnect to Saved Session
              </button>
            </div>
          )}

          <div style={{ background: 'rgba(255,255,255,0.04)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border-glass)', marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#38bdf8', fontWeight: 700, marginBottom: '0.8rem' }}>
              Dining Together? Connect to Table Session
            </label>
            <div style={{ display: 'flex', gap: '0.6rem' }}>
              <input
                type="text"
                placeholder="e.g. SESS-A1B2C3D4"
                value={manualSessionToken}
                onChange={(e) => setManualSessionToken(e.target.value)}
                style={{
                  flex: 1,
                  padding: '0.75rem 1rem',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid var(--border-glass)',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '0.9rem',
                  textTransform: 'uppercase'
                }}
              />
              <button
                onClick={() => handleConnectSession()}
                className="btn-primary"
                style={{ padding: '0.75rem 1.2rem' }}
              >
                Connect
              </button>
            </div>
          </div>

          <button
            onClick={() => window.location.reload()}
            className="btn-secondary"
            style={{ width: '100%', justifyContent: 'center' }}
          >
            <RefreshCw size={16} /> Check Table Availability Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '1.5rem 1rem 6rem 1rem' }}>
      
      {/* Top Banner */}
      <div className="glass-panel" style={{
        padding: '1.2rem 1.5rem',
        marginBottom: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          <div style={{
            background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
            padding: '0.75rem',
            borderRadius: '12px',
            color: '#fff',
            fontWeight: 800,
            fontSize: '1.2rem',
            boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)'
          }}>
            T-{tNum}
          </div>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              Table #{tNum}
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 10px #10b981', display: 'inline-block' }} />
            </h2>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Gourmet QR In-Dining Experience
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', flex: '1 1 auto', width: '100%', maxWidth: '100%' }}>
          <button onClick={() => setIsOrdersOpen(true)} className="btn-secondary" style={{ flex: '1 1 auto', justifyContent: 'center', padding: '0.65rem 0.85rem', fontSize: '0.85rem', whiteSpace: 'nowrap', position: 'relative' }}>
            <Clock size={16} /> My Orders
            {myOrders.length > 0 && (
              <span style={{ position: 'absolute', top: '-6px', right: '-6px', background: '#38bdf8', color: '#0f172a', borderRadius: '9999px', width: '18px', height: '18px', fontSize: '0.7rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {myOrders.length}
              </span>
            )}
          </button>

          {/* Pay Bill & Checkout Button */}
          <button
            onClick={async () => {
              if (!myOrders || myOrders.length === 0) {
                alert('⚠️ No Active Orders Found!\n\nYour order history is currently empty. Please select items from the menu and place an order first before paying the bill.');
                return;
              }
              if (!completedReceipt && session?.sessionToken) {
                try {
                  const rec = await customerApi.getBillReceipt(session.sessionToken);
                  if (rec && rec.isPaid) setCompletedReceipt(rec);
                } catch (e) {}
              }
              setIsPayBillOpen(true);
            }}
            className="btn-primary"
            style={{
              flex: '1 1 auto',
              justifyContent: 'center',
              padding: '0.65rem 0.85rem',
              fontSize: '0.85rem',
              whiteSpace: 'nowrap',
              background: (!myOrders || myOrders.length === 0) ? 'rgba(148, 163, 184, 0.2)' : (completedReceipt?.isPaid ? 'linear-gradient(135deg, #10b981 0%, #047857 100%)' : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'),
              boxShadow: (!myOrders || myOrders.length === 0) ? 'none' : (completedReceipt?.isPaid ? '0 4px 15px rgba(16, 185, 129, 0.3)' : '0 4px 15px rgba(245, 158, 11, 0.3)'),
              opacity: (!myOrders || myOrders.length === 0) ? 0.7 : 1
            }}
          >
            {completedReceipt?.isPaid ? <CheckCircle2 size={16} /> : <CreditCard size={16} />}
            {completedReceipt?.isPaid ? 'Paid Receipt' : 'Pay Bill'}
          </button>

          <button onClick={() => setIsAssistanceOpen(true)} className="btn-secondary" style={{ flex: '1 1 auto', justifyContent: 'center', padding: '0.65rem 0.85rem', fontSize: '0.85rem', whiteSpace: 'nowrap', background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', borderColor: 'rgba(245, 158, 11, 0.3)' }}>
            <Bell size={16} /> Call Waiter
          </button>
        </div>
      </div>

      {/* Dietary Pill Slider (All, Veg, Non-Veg) */}
      <div style={{
        position: 'relative',
        display: 'flex',
        background: 'rgba(15, 23, 42, 0.7)',
        padding: '0.35rem',
        borderRadius: '16px',
        border: '1px solid var(--border-glass)',
        backdropFilter: 'blur(12px)',
        width: '100%',
        maxWidth: '420px',
        margin: '0 auto 1.5rem auto'
      }}>
        {/* Animated Sliding Indicator */}
        <div style={{
          position: 'absolute',
          top: '0.35rem',
          bottom: '0.35rem',
          left: dietaryFilter === 'ALL' ? '0.35rem' : (dietaryFilter === 'VEG' ? 'calc(33.33% + 0.15rem)' : 'calc(66.66% - 0.15rem)'),
          width: 'calc(33.33% - 0.35rem)',
          borderRadius: '12px',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          background: dietaryFilter === 'ALL'
            ? 'linear-gradient(135deg, #10b981 0%, #38bdf8 100%)'
            : (dietaryFilter === 'VEG' ? 'linear-gradient(135deg, #059669 0%, #10b981 100%)' : 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)'),
          boxShadow: dietaryFilter === 'ALL'
            ? '0 4px 15px rgba(56, 189, 248, 0.35)'
            : (dietaryFilter === 'VEG' ? '0 4px 15px rgba(16, 185, 129, 0.4)' : '0 4px 15px rgba(239, 68, 68, 0.4)'),
          zIndex: 1
        }} />

        <button
          onClick={() => setDietaryFilter('ALL')}
          style={{
            flex: 1,
            padding: '0.6rem 0.5rem',
            borderRadius: '12px',
            border: 'none',
            background: 'transparent',
            color: dietaryFilter === 'ALL' ? '#fff' : 'var(--text-muted)',
            fontWeight: dietaryFilter === 'ALL' ? 800 : 600,
            fontSize: '0.85rem',
            cursor: 'pointer',
            zIndex: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.4rem',
            transition: 'color 0.2s ease'
          }}
        >
          <span>✨</span> All Menu
        </button>

        <button
          onClick={() => setDietaryFilter('VEG')}
          style={{
            flex: 1,
            padding: '0.6rem 0.5rem',
            borderRadius: '12px',
            border: 'none',
            background: 'transparent',
            color: dietaryFilter === 'VEG' ? '#fff' : 'var(--text-muted)',
            fontWeight: dietaryFilter === 'VEG' ? 800 : 600,
            fontSize: '0.85rem',
            cursor: 'pointer',
            zIndex: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.4rem',
            transition: 'color 0.2s ease'
          }}
        >
          <span style={{
            width: '13px',
            height: '13px',
            border: dietaryFilter === 'VEG' ? '1.5px solid #fff' : '1.5px solid #10b981',
            padding: '1.5px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '3px'
          }}>
            <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: dietaryFilter === 'VEG' ? '#fff' : '#10b981' }} />
          </span>
          Pure Veg
        </button>

        <button
          onClick={() => setDietaryFilter('NON_VEG')}
          style={{
            flex: 1,
            padding: '0.6rem 0.5rem',
            borderRadius: '12px',
            border: 'none',
            background: 'transparent',
            color: dietaryFilter === 'NON_VEG' ? '#fff' : 'var(--text-muted)',
            fontWeight: dietaryFilter === 'NON_VEG' ? 800 : 600,
            fontSize: '0.85rem',
            cursor: 'pointer',
            zIndex: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.4rem',
            transition: 'color 0.2s ease'
          }}
        >
          <span style={{
            width: '13px',
            height: '13px',
            border: dietaryFilter === 'NON_VEG' ? '1.5px solid #fff' : '1.5px solid #ef4444',
            padding: '1.5px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '3px'
          }}>
            <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: dietaryFilter === 'NON_VEG' ? '#fff' : '#ef4444' }} />
          </span>
          Non-Veg
        </button>
      </div>

      {/* Category Pills & Search */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ position: 'relative', width: '100%' }}>
          <Search size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
          <input
            type="text"
            placeholder="Search delicious dishes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '100%', padding: '0.85rem 1rem 0.85rem 3rem', background: 'rgba(30, 41, 59, 0.7)', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-md)', color: '#fff', fontSize: '0.95rem', outline: 'none' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.6rem', overflowX: 'auto', paddingBottom: '0.4rem' }}>
          <button onClick={() => setSelectedCategory(null)} style={{ padding: '0.6rem 1.2rem', borderRadius: '9999px', fontSize: '0.85rem', fontWeight: 600, whiteSpace: 'nowrap', background: !selectedCategory ? '#10b981' : 'rgba(255, 255, 255, 0.05)', color: !selectedCategory ? '#fff' : 'var(--text-muted)', border: !selectedCategory ? '1px solid #10b981' : '1px solid var(--border-glass)' }}>
            All Categories
          </button>
          {categories.map(cat => (
            <button key={cat.id} onClick={() => setSelectedCategory(cat.id)} style={{ padding: '0.6rem 1.2rem', borderRadius: '9999px', fontSize: '0.85rem', fontWeight: 600, whiteSpace: 'nowrap', background: selectedCategory === cat.id ? '#10b981' : 'rgba(255, 255, 255, 0.05)', color: selectedCategory === cat.id ? '#fff' : 'var(--text-muted)', border: selectedCategory === cat.id ? '1px solid #10b981' : '1px solid var(--border-glass)' }}>
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Menu Dish Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
        {filteredDishes.map(dish => (
          <div key={dish.id} className="glass-panel" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', transition: 'all 0.2s ease' }}>
            <div style={{ height: '180px', width: '100%', position: 'relative', overflow: 'hidden' }}>
              <img src={dish.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80'} alt={dish.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              
              {/* Veg / Non-Veg Badge */}
              <span style={{
                position: 'absolute',
                top: '0.75rem',
                left: '0.75rem',
                background: 'rgba(15, 23, 42, 0.8)',
                backdropFilter: 'blur(8px)',
                border: checkIsVeg(dish) ? '1px solid rgba(16, 185, 129, 0.5)' : '1px solid rgba(239, 68, 68, 0.5)',
                padding: '0.25rem 0.55rem',
                borderRadius: '8px',
                fontSize: '0.72rem',
                fontWeight: 700,
                color: checkIsVeg(dish) ? '#34d399' : '#f87171',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}>
                <span style={{
                  width: '10px',
                  height: '10px',
                  border: checkIsVeg(dish) ? '1.5px solid #10b981' : '1.5px solid #ef4444',
                  padding: '1px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '2px'
                }}>
                  <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: checkIsVeg(dish) ? '#10b981' : '#ef4444' }} />
                </span>
                {checkIsVeg(dish) ? 'VEG' : 'NON-VEG'}
              </span>

              <span className="badge badge-available" style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', backdropFilter: 'blur(8px)' }}>{dish.category?.name || 'Gourmet'}</span>
            </div>

            <div style={{ padding: '1.2rem', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', marginBottom: '0.4rem' }}>{dish.name}</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.4, marginBottom: '1rem' }}>{dish.description}</p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.5rem' }}>
                <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#10b981' }}>${dish.price.toFixed(2)}</span>
                <button onClick={() => openCustomization(dish)} className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}><Plus size={16} /> Add to Order</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Floating Cart Trigger Bar */}
      {cart.length > 0 && !completedReceipt?.isPaid && (
        <div style={{ position: 'fixed', bottom: '1.5rem', left: '50%', transform: 'translateX(-50%)', zIndex: 40, width: '90%', maxWidth: '500px' }}>
          <button onClick={() => setIsCartOpen(true)} className="btn-primary pulse-alert" style={{ width: '100%', justifyContent: 'space-between', padding: '1rem 1.5rem', borderRadius: '9999px', fontSize: '1rem', boxShadow: '0 10px 30px rgba(16, 185, 129, 0.5)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}><ShoppingBag size={22} /><span>{cart.reduce((a, b) => a + b.quantity, 0)} Items in Cart</span></div>
            <span style={{ fontWeight: 800 }}>${grandTotal.toFixed(2)} →</span>
          </button>
        </div>
      )}

      {/* Customization Modal */}
      {customizingDish && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="glass-panel animate-fade-in" style={{ maxWidth: '450px', width: '100%', padding: '1.8rem', position: 'relative' }}>
            <button onClick={() => setCustomizingDish(null)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', color: 'var(--text-muted)' }}><X size={20} /></button>

            <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#fff', marginBottom: '0.3rem' }}>{customizingDish.name}</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.2rem' }}>{customizingDish.description}</p>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.05)', padding: '0.75rem 1rem', borderRadius: '12px', marginBottom: '1.2rem' }}>
              <span style={{ fontWeight: 600, fontSize: '0.9rem', color: '#fff' }}>Quantity</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="btn-secondary" style={{ padding: '0.3rem 0.6rem' }}><Minus size={14} /></button>
                <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="btn-secondary" style={{ padding: '0.3rem 0.6rem' }}><Plus size={14} /></button>
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.4rem', fontWeight: 600 }}>Special Instructions / Allergies</label>
              <textarea placeholder="e.g. Less spicy, no onions, extra dressing..." value={specialInstructions} onChange={(e) => setSpecialInstructions(e.target.value)} style={{ width: '100%', height: '80px', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-glass)', borderRadius: '8px', color: '#fff', fontSize: '0.85rem', outline: 'none' }} />
            </div>

            <button onClick={handleAddToCart} className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>Add to Cart • ${(customizingDish.price * quantity).toFixed(2)}</button>
          </div>
        </div>
      )}

      {/* Cart Drawer */}
      {isCartOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 100, display: 'flex', justifyContent: 'flex-end' }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '420px', height: '100%', borderRadius: 0, padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-glass)' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff' }}>Your Table Cart</h3>
              <button onClick={() => setIsCartOpen(false)} style={{ background: 'none', color: 'var(--text-muted)' }}><X size={20} /></button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {cart.map((item, idx) => (
                <div key={idx} style={{ background: 'rgba(255,255,255,0.04)', padding: '0.85rem', borderRadius: '12px', border: '1px solid var(--border-glass)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                    <span style={{ fontWeight: 700, color: '#fff' }}>{item.dish.name} x{item.quantity}</span>
                    <span style={{ fontWeight: 700, color: '#10b981' }}>${(item.dish.price * item.quantity).toFixed(2)}</span>
                  </div>
                  {item.specialInstructions && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Note: {item.specialInstructions}</span>}
                </div>
              ))}
            </div>

            <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--border-glass)', marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.9rem' }}><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.9rem' }}><span>Tax (5%)</span><span>${tax.toFixed(2)}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#fff', fontSize: '1.2rem', fontWeight: 800, marginTop: '0.3rem' }}><span>Total</span><span style={{ color: '#10b981' }}>${grandTotal.toFixed(2)}</span></div>

              <button
                onClick={handlePlaceOrder}
                disabled={isPlacingOrder || cart.length === 0}
                className="btn-primary"
                style={{
                  width: '100%',
                  justify: 'center',
                  padding: '1rem',
                  marginTop: '1rem',
                  opacity: isPlacingOrder ? 0.6 : 1,
                  cursor: isPlacingOrder ? 'not-allowed' : 'pointer',
                  pointerEvents: isPlacingOrder ? 'none' : 'auto'
                }}
              >
                {isPlacingOrder ? 'Sending Order to Kitchen...' : 'Send Order to Kitchen'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pay Bill & Customer Review Modal */}
      {isPayBillOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="glass-panel animate-fade-in" style={{ maxWidth: '520px', width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '1.8rem', position: 'relative' }}>
            <button onClick={() => { setIsPayBillOpen(false); if (!completedReceipt?.isPaid) { setCompletedReceipt(null); setCashRequested(false); } }} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', color: 'var(--text-muted)' }}><X size={20} /></button>

            {!completedReceipt ? (
              <div>
                <div style={{ textAlign: 'center', marginBottom: '1.2rem' }}>
                  <div style={{ display: 'inline-flex', padding: '0.8rem', background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', borderRadius: '12px', marginBottom: '0.5rem' }}>
                    <CreditCard size={32} />
                  </div>
                  <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff' }}>Table #{tNum} Bill & Checkout</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Generate digital tax invoice and complete payment</p>
                </div>

                {/* Optional Customer Details */}
                <div style={{ background: 'rgba(255,255,255,0.04)', padding: '1rem', borderRadius: '12px', marginBottom: '1.2rem', border: '1px solid var(--border-glass)' }}>
                  <span style={{ fontSize: '0.8rem', color: '#38bdf8', fontWeight: 700, display: 'block', marginBottom: '0.8rem' }}>
                    Customer Details (Optional for Digital Receipt)
                  </span>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    <input type="text" placeholder="Full Name (Optional)" value={customerName} onChange={(e) => setCustomerName(e.target.value)} style={{ padding: '0.65rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-glass)', borderRadius: '6px', color: '#fff', fontSize: '0.85rem' }} />
                    <div style={{ display: 'flex', gap: '0.6rem' }}>
                      <input type="text" placeholder="Phone Number (Optional)" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} style={{ flex: 1, padding: '0.65rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-glass)', borderRadius: '6px', color: '#fff', fontSize: '0.85rem' }} />
                      <input type="email" placeholder="Email Address (Optional)" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} style={{ flex: 1, padding: '0.65rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-glass)', borderRadius: '6px', color: '#fff', fontSize: '0.85rem' }} />
                    </div>
                  </div>
                </div>

                {/* 5-Star Rating & Review */}
                <div style={{ background: 'rgba(255,255,255,0.04)', padding: '1rem', borderRadius: '12px', marginBottom: '1.2rem', border: '1px solid var(--border-glass)' }}>
                  <span style={{ fontSize: '0.8rem', color: '#fbbf24', fontWeight: 700, display: 'block', marginBottom: '0.5rem' }}>
                    Rate Your Dining Experience
                  </span>

                  <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.6rem', justifyContent: 'center' }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button key={star} onClick={() => setRating(star)} style={{ background: 'none' }}>
                        <Star size={24} fill={star <= rating ? '#fbbf24' : 'none'} color={star <= rating ? '#fbbf24' : 'var(--text-dim)'} />
                      </button>
                    ))}
                  </div>

                  <input type="text" placeholder="Write feedback or review comments (Optional)..." value={reviewComments} onChange={(e) => setReviewComments(e.target.value)} style={{ width: '100%', padding: '0.65rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-glass)', borderRadius: '6px', color: '#fff', fontSize: '0.85rem' }} />
                </div>

                {/* Payment Method Selector */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 700 }}>Select Payment Mode</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.6rem' }}>
                    <button onClick={() => setPaymentMethod('CARD')} style={{ padding: '0.75rem 0.5rem', borderRadius: '8px', border: paymentMethod === 'CARD' ? '2px solid #10b981' : '1px solid var(--border-glass)', background: paymentMethod === 'CARD' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255,255,255,0.05)', color: '#fff', fontWeight: 700, fontSize: '0.85rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.3rem' }}>
                      <CreditCard size={18} /> Card
                    </button>
                    <button onClick={() => setPaymentMethod('UPI_QR')} style={{ padding: '0.75rem 0.5rem', borderRadius: '8px', border: paymentMethod === 'UPI_QR' ? '2px solid #38bdf8' : '1px solid var(--border-glass)', background: paymentMethod === 'UPI_QR' ? 'rgba(6, 182, 212, 0.2)' : 'rgba(255,255,255,0.05)', color: '#fff', fontWeight: 700, fontSize: '0.85rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.3rem' }}>
                      <QrCode size={18} /> UPI / QR
                    </button>
                    <button onClick={() => setPaymentMethod('CASH')} style={{ padding: '0.75rem 0.5rem', borderRadius: '8px', border: paymentMethod === 'CASH' ? '2px solid #f59e0b' : '1px solid var(--border-glass)', background: paymentMethod === 'CASH' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255,255,255,0.05)', color: '#fff', fontWeight: 700, fontSize: '0.85rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.3rem' }}>
                      <DollarSign size={18} /> Cash
                    </button>
                  </div>
                </div>

                <button onClick={handleProcessPayment} disabled={loadingPayment} className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '1rem', fontSize: '1rem' }}>
                  {loadingPayment ? 'Processing...' : (paymentMethod === 'CASH' ? '💰 Request Waiter for Cash Collection' : '💳 Pay & Generate Digital Receipt')}
                </button>
              </div>
            ) : (
              /* Digital Receipt & Confirmation Display */
              <div style={{ textAlign: 'center' }}>
                {cashRequested ? (
                  <div style={{ padding: '1.5rem', background: 'rgba(245, 158, 11, 0.15)', borderRadius: '16px', border: '1px solid rgba(245, 158, 11, 0.4)', marginBottom: '1.5rem' }}>
                    <Bell size={42} style={{ color: '#fbbf24', margin: '0 auto 0.5rem' }} />
                    <h4 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fff' }}>Waiter Dispatched for Cash Collection!</h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.4rem', lineHeight: 1.5 }}>
                      A waiter has been notified to arrive at <strong>Table #{tNum}</strong> to collect your cash payment of <strong>${completedReceipt.totalAmount?.toFixed(2)}</strong>.
                    </p>
                    <div style={{ marginTop: '0.8rem', padding: '0.6rem', background: 'rgba(0,0,0,0.4)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', color: '#10b981', fontWeight: 700, fontSize: '0.85rem' }}>
                      <PhoneCall size={14} /> Waiter Mobile Hotline: +1 (555) 019-WAIT
                    </div>
                  </div>
                ) : (
                  <div style={{ padding: '1rem', background: 'rgba(16, 185, 129, 0.15)', borderRadius: '16px', border: '1px solid rgba(16, 185, 129, 0.4)', marginBottom: '1.5rem' }}>
                    <CheckCircle2 size={42} style={{ color: '#10b981', margin: '0 auto 0.4rem' }} />
                    <h4 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fff' }}>Payment Successful!</h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Thank you for dining with us!</p>
                  </div>
                )}

                {/* Printable Digital Tax Invoice */}
                <div style={{ background: '#fff', color: '#000', padding: '1.5rem', borderRadius: '12px', textAlign: 'left', fontSize: '0.85rem', fontFamily: 'monospace', marginBottom: '1.5rem', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}>
                  <div style={{ textAlign: 'center', borderBottom: '1px dashed #000', paddingBottom: '0.5rem', marginBottom: '0.8rem' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>GOURMET RESTAURANT</h3>
                    <p>Tax Invoice / Receipt</p>
                    <p style={{ fontSize: '0.75rem' }}>Receipt: {completedReceipt.receiptNumber} • Table #{completedReceipt.tableNumber}</p>
                    <p style={{ fontSize: '0.75rem' }}>Date: {new Date(completedReceipt.createdAt).toLocaleString()}</p>
                  </div>

                  {completedReceipt.customerName && (
                    <div style={{ marginBottom: '0.5rem', borderBottom: '1px dashed #ccc', paddingBottom: '0.3rem' }}>
                      Customer: {completedReceipt.customerName} ({completedReceipt.phoneNumber || 'N/A'})
                    </div>
                  )}

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', marginBottom: '0.8rem' }}>
                    {completedReceipt.items?.map((it, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>{it.quantity}x {it.dishName}</span>
                        <span>${it.itemTotal?.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  <div style={{ borderTop: '1px dashed #000', paddingTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Subtotal</span><span>${completedReceipt.subtotal?.toFixed(2)}</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Tax (5%)</span><span>${completedReceipt.taxAmount?.toFixed(2)}</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1rem', marginTop: '0.3rem' }}><span>TOTAL PAID</span><span>${completedReceipt.totalAmount?.toFixed(2)}</span></div>
                  </div>

                  <div style={{ textAlign: 'center', marginTop: '1rem', paddingTop: '0.5rem', borderTop: '1px dashed #000', fontSize: '0.75rem' }}>
                    Payment Mode: {completedReceipt.paymentMethod} • Rating: {'★'.repeat(completedReceipt.rating || 5)}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.8rem' }}>
                  <button onClick={() => window.print()} className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>
                    <Printer size={16} /> Print Receipt
                  </button>
                  <button
                    onClick={() => {
                      setIsPayBillOpen(false);
                      if (completedReceipt?.isPaid) {
                        sessionStorage.removeItem('currentSession');
                      } else {
                        setCompletedReceipt(null);
                        setCashRequested(false);
                      }
                    }}
                    className="btn-primary"
                    style={{ flex: 1, justifyContent: 'center' }}
                  >
                    {completedReceipt?.isPaid ? 'Finish & Reset Session' : 'Close Window'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Orders Tracking Modal */}
      {isOrdersOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="glass-panel animate-fade-in" style={{ maxWidth: '550px', width: '100%', maxHeight: '85vh', padding: '1.8rem', display: 'flex', flexDirection: 'column', position: 'relative' }}>
            <button onClick={() => setIsOrdersOpen(false)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', color: 'var(--text-muted)' }}><X size={20} /></button>

            <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#fff', marginBottom: '1rem' }}>Table #{tNum} Order History</h3>

            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {myOrders.length === 0 ? (
                <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>No orders placed yet for this table session.</p>
              ) : (
                myOrders.map(order => (
                  <div key={order.orderId} style={{ background: 'rgba(255,255,255,0.04)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-glass)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                      <span style={{ fontWeight: 800, color: '#fff' }}>{order.orderNumber}</span>
                      <span className={`badge badge-${order.status?.toLowerCase()}`}>{order.status}</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      {order.items?.map((it, idx) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>{it.quantity}x {it.dishName}</span>
                          <span>${it.itemTotal?.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>

                    <div style={{ marginTop: '0.8rem', paddingTop: '0.6rem', borderTop: '1px dashed var(--border-glass)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 700, color: '#10b981' }}>
                      <span>Total: ${order.totalAmount?.toFixed(2)}</span>
                      {order.status === 'PLACED' && (
                        <button
                          onClick={() => handleCancelOrder(order.orderId)}
                          className="btn-secondary"
                          style={{
                            background: 'rgba(244, 63, 94, 0.15)',
                            color: '#f87171',
                            borderColor: 'rgba(244, 63, 94, 0.3)',
                            padding: '0.3rem 0.75rem',
                            fontSize: '0.75rem',
                            fontWeight: 700
                          }}
                        >
                          Cancel Order (Uncooked)
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Call Assistance Modal */}
      {isAssistanceOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="glass-panel animate-fade-in" style={{ maxWidth: '420px', width: '100%', padding: '1.8rem', position: 'relative' }}>
            <button onClick={() => setIsAssistanceOpen(false)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', color: 'var(--text-muted)' }}><X size={20} /></button>

            <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#fff', marginBottom: '0.5rem' }}>Call Table Service</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.2rem' }}>Request instant assistance to Table #{tNum}</p>

            {assistanceSuccess ? (
              <div style={{ textAlign: 'center', padding: '2rem 0', color: '#10b981' }}>
                <CheckCircle2 size={48} style={{ margin: '0 auto 0.5rem' }} />
                <h4 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Request Sent!</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>A waiter will attend Table #{tNum} shortly.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.4rem', fontWeight: 600 }}>Select Request Type</label>
                  <select value={assistanceType} onChange={(e) => setAssistanceType(e.target.value)} style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-glass)', borderRadius: '8px', color: '#fff', outline: 'none' }}>
                    <option value="WATER" style={{ background: '#0f172a' }}>💧 Water Refill</option>
                    <option value="BILL_REQUEST" style={{ background: '#0f172a' }}>💳 Request Final Bill</option>
                    <option value="WAITER_HELP" style={{ background: '#0f172a' }}>🙋 Waiter Assistance</option>
                    <option value="CLEAN_TABLE" style={{ background: '#0f172a' }}>🧹 Clean Table</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.4rem', fontWeight: 600 }}>Note (Optional)</label>
                  <input type="text" placeholder="e.g. Extra napkins please..." value={assistanceNote} onChange={(e) => setAssistanceNote(e.target.value)} style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-glass)', borderRadius: '8px', color: '#fff', outline: 'none' }} />
                </div>

                <button
                  onClick={handleSendAssistance}
                  disabled={isSendingAssistance}
                  className="btn-primary"
                  style={{
                    width: '100%',
                    justifyContent: 'center',
                    marginTop: '0.5rem',
                    opacity: isSendingAssistance ? 0.6 : 1,
                    cursor: isSendingAssistance ? 'not-allowed' : 'pointer',
                    pointerEvents: isSendingAssistance ? 'none' : 'auto'
                  }}
                >
                  {isSendingAssistance ? 'Sending Alert...' : 'Send Alert to Waiters'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
