import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { QRCodeSVG } from 'qrcode.react';
import confetti from 'canvas-confetti';
import { Receipt, CreditCard, QrCode, Banknote, Star, CheckCircle2, AlertCircle } from 'lucide-react';

export default function BillReceiptModal({
  isOpen,
  onClose,
  receipt,
  onProcessPayment,
  isProcessing = false,
  tableNumber,
  onRefresh,
  onSessionComplete,
}) {
  const [paymentMethod, setPaymentMethod] = useState('CARD'); // 'CARD' | 'UPI_QR' | 'CASH'
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [rating, setRating] = useState(5);
  const [reviewComments, setReviewComments] = useState('');
  const [paymentSuccessData, setPaymentSuccessData] = useState(null);

  useEffect(() => {
    if (isOpen) {
      if (onRefresh) onRefresh();
      if (receipt?.isPaid) {
        setPaymentSuccessData(receipt);
      } else {
        setPaymentSuccessData(null);
      }
    }
  }, [isOpen, onRefresh]);

  if (!receipt && !paymentSuccessData) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Itemized Bill & Receipt">
        <div className="py-8 text-center text-xs" style={{ color: 'var(--color-text-muted)' }}>
          Loading bill calculations from server...
        </div>
      </Modal>
    );
  }

  const activeData = paymentSuccessData || receipt;
  const isPaid = activeData?.isPaid || Boolean(paymentSuccessData);

  const handlePay = async () => {
    try {
      const result = await onProcessPayment({
        paymentMethod,
        customerName: customerName.trim() || undefined,
        phoneNumber: customerPhone.trim() || undefined,
        email: customerEmail.trim() || undefined,
        rating,
        reviewComments: reviewComments.trim() || undefined,
      });

      setPaymentSuccessData(result);

      if (paymentMethod !== 'CASH') {
        try {
          confetti({
            particleCount: 60,
            spread: 55,
            origin: { y: 0.6 },
          });
        } catch {
          // Ignore
        }
      }
    } catch (err) {
      // Error handled by parent toast
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isPaid ? 'Payment Confirmed' : 'Table Receipt & Checkout'}
      subtitle={tableNumber ? `Table #${tableNumber} • Server-calculated receipt` : 'Receipt breakdown'}
      maxWidth="max-w-lg"
    >
      <div className="flex flex-col gap-4">
        {/* Receipt Header Badge */}
        <div
          className="p-3.5 rounded-xl border flex items-center justify-between gap-3"
          style={{
            backgroundColor: isPaid ? 'var(--color-success-bg)' : 'var(--color-surface-sunken)',
            borderColor: isPaid ? 'var(--color-success-border)' : 'var(--color-border)',
            color: isPaid ? 'var(--color-success)' : 'var(--color-text)',
          }}
        >
          <div className="flex items-center gap-2">
            {isPaid ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <Receipt className="w-5 h-5 text-primary" />}
            <div>
              <div className="text-xs font-bold leading-tight">
                {isPaid ? 'Bill Settled Successfully' : 'Gourmet Bistro Invoice'}
              </div>
              <div className="text-[11px] font-mono opacity-80">
                Receipt #{activeData?.receiptNumber || 'PENDING'}
              </div>
            </div>
          </div>

          <span
            className="text-xs font-bold px-2 py-0.5 rounded-md border font-mono uppercase"
            style={{
              backgroundColor: isPaid ? 'var(--color-surface)' : 'var(--color-warning-bg)',
              color: isPaid ? 'var(--color-success)' : 'var(--color-warning)',
              borderColor: 'var(--color-border)',
            }}
          >
            {isPaid ? 'PAID' : 'UNPAID'}
          </span>
        </div>

        {/* Itemized Order List */}
        <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--color-border)' }}>
          <div
            className="px-3.5 py-2 text-[11px] font-mono uppercase tracking-wider border-b flex justify-between"
            style={{
              backgroundColor: 'var(--color-surface-raised)',
              borderColor: 'var(--color-border)',
              color: 'var(--color-text-muted)',
            }}
          >
            <span>Items Ordered</span>
            <span>Total</span>
          </div>

          <div className="p-3.5 flex flex-col gap-2 max-h-48 overflow-y-auto text-xs">
            {(activeData?.items || []).length === 0 ? (
              <span className="text-xs italic" style={{ color: 'var(--color-text-muted)' }}>
                No active orders found on table session.
              </span>
            ) : (
              (activeData?.items || []).map((item, idx) => (
                <div key={item.id || idx} className="flex justify-between items-start gap-2">
                  <div className="min-w-0">
                    <span className="font-semibold">{item.dishName}</span>
                    <span className="text-[11px] ml-1.5 opacity-70 font-mono">
                      ×{item.quantity}
                    </span>
                  </div>
                  <span className="font-mono font-medium shrink-0">
                    ₹{Number(item.itemTotal || (item.unitPrice * item.quantity)).toFixed(2)}
                  </span>
                </div>
              ))
            )}
          </div>

          {/* Subtotal & 5% Tax Calculations */}
          <div
            className="p-3.5 border-t space-y-1.5 text-xs font-mono"
            style={{
              backgroundColor: 'var(--color-surface-sunken)',
              borderColor: 'var(--color-border)',
            }}
          >
            <div className="flex justify-between" style={{ color: 'var(--color-text-muted)' }}>
              <span>Subtotal</span>
              <span>₹{Number(activeData?.subtotal || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between" style={{ color: 'var(--color-text-muted)' }}>
              <span>GST & Restaurant Tax (5%)</span>
              <span>₹{Number(activeData?.taxAmount || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm font-bold pt-1.5 border-t" style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}>
              <span className="font-sans">Grand Total</span>
              <span className="text-base text-primary">₹{Number(activeData?.totalAmount || 0).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Payment Simulation Section (If Unpaid) */}
        {!isPaid ? (
          <div className="flex flex-col gap-3">
            <label className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
              Choose Payment Method
            </label>

            {/* Methods Tabs */}
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('CARD')}
                className={`p-2.5 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                  paymentMethod === 'CARD' ? 'shadow-sm font-semibold' : 'hover:opacity-80'
                }`}
                style={
                  paymentMethod === 'CARD'
                    ? {
                        backgroundColor: 'var(--color-primary-container)',
                        color: 'var(--color-on-primary-container)',
                        borderColor: 'var(--color-primary)',
                      }
                    : {
                        backgroundColor: 'var(--color-surface-sunken)',
                        borderColor: 'var(--color-border)',
                        color: 'var(--color-text)',
                      }
                }
              >
                <CreditCard className="w-4 h-4" />
                <span className="text-xs">Credit / Debit</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('UPI_QR')}
                className={`p-2.5 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                  paymentMethod === 'UPI_QR' ? 'shadow-sm font-semibold' : 'hover:opacity-80'
                }`}
                style={
                  paymentMethod === 'UPI_QR'
                    ? {
                        backgroundColor: 'var(--color-primary-container)',
                        color: 'var(--color-on-primary-container)',
                        borderColor: 'var(--color-primary)',
                      }
                    : {
                        backgroundColor: 'var(--color-surface-sunken)',
                        borderColor: 'var(--color-border)',
                        color: 'var(--color-text)',
                      }
                }
              >
                <QrCode className="w-4 h-4" />
                <span className="text-xs">UPI QR</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('CASH')}
                className={`p-2.5 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                  paymentMethod === 'CASH' ? 'shadow-sm font-semibold' : 'hover:opacity-80'
                }`}
                style={
                  paymentMethod === 'CASH'
                    ? {
                        backgroundColor: 'var(--color-primary-container)',
                        color: 'var(--color-on-primary-container)',
                        borderColor: 'var(--color-primary)',
                      }
                    : {
                        backgroundColor: 'var(--color-surface-sunken)',
                        borderColor: 'var(--color-border)',
                        color: 'var(--color-text)',
                      }
                }
              >
                <Banknote className="w-4 h-4" />
                <span className="text-xs">Pay Cash</span>
              </button>
            </div>

            {/* UPI QR Display if UPI selected */}
            {paymentMethod === 'UPI_QR' && (
              <div
                className="p-4 rounded-xl border flex flex-col items-center text-center gap-2"
                style={{
                  backgroundColor: 'var(--color-surface)',
                  borderColor: 'var(--color-border)',
                }}
              >
                <div className="p-2.5 bg-white rounded-xl shadow-xs border">
                  <QRCodeSVG
                    value={`upi://pay?pa=gourmetbistro@upi&pn=Gourmet%20Bistro&am=${Number(activeData?.totalAmount || 0).toFixed(2)}&cu=INR`}
                    size={130}
                  />
                </div>
                <span className="text-[11px] font-mono" style={{ color: 'var(--color-text-muted)' }}>
                  Scan with any UPI app (GPay, PhonePe, Paytm)
                </span>
              </div>
            )}

            {/* Cash instructions */}
            {paymentMethod === 'CASH' && (
              <div
                className="p-3 rounded-xl border text-xs"
                style={{
                  backgroundColor: 'var(--color-warning-bg)',
                  borderColor: 'var(--color-warning-border)',
                  color: 'var(--color-warning)',
                }}
              >
                A waiter assistance request will be automatically dispatched to Table #{tableNumber} to collect cash and deliver your printed physical invoice.
              </div>
            )}

            {/* Optional Customer Review Rating */}
            <div className="pt-2 border-t flex flex-col gap-2" style={{ borderColor: 'var(--color-border)' }}>
              <span className="text-xs font-semibold">How was your dining experience?</span>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 text-amber-400 hover:scale-110 transition-transform cursor-pointer"
                    aria-label={`${star} star rating`}
                  >
                    <Star
                      className="w-5 h-5"
                      fill={star <= rating ? 'currentColor' : 'none'}
                    />
                  </button>
                ))}
              </div>

              <input
                type="text"
                value={reviewComments}
                onChange={(e) => setReviewComments(e.target.value)}
                placeholder="Leave feedback for our chef (optional)"
                className="w-full p-2 rounded-lg text-xs border focus:outline-none"
                style={{
                  backgroundColor: 'var(--color-surface-sunken)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text)',
                }}
                maxLength={200}
              />
            </div>

            {/* Transparent Note on Simulated Backend Payment */}
            <p className="text-[11px] italic text-center" style={{ color: 'var(--color-text-subtle)' }}>
              Payment processing is simulated on the backend to reconcile table orders and liberate the table session.
            </p>

            {/* Pay Button */}
            <Button
              variant="primary"
              size="lg"
              loading={isProcessing}
              onClick={handlePay}
              className="w-full mt-1"
            >
              {paymentMethod === 'CASH'
                ? 'Request Cash Collection at Table'
                : `Complete Simulated Payment • ₹${Number(activeData?.totalAmount || 0).toFixed(2)}`}
            </Button>
          </div>
        ) : (
          /* Payment Completed View */
          <div className="flex flex-col items-center text-center py-4 gap-3">
            <div
              className="w-12 h-12 rounded-full border flex items-center justify-center"
              style={{
                backgroundColor: 'var(--color-success-bg)',
                borderColor: 'var(--color-success-border)',
                color: 'var(--color-success)',
              }}
            >
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <h4 className="text-base font-bold">Thank You for Dining with Us!</h4>
            <p className="text-xs max-w-xs" style={{ color: 'var(--color-text-muted)' }}>
              Your bill has been recorded and settled. Table #{tableNumber} session is now complete.
            </p>

            <Button
              variant="outline"
              size="md"
              onClick={() => {
                onClose();
                if (onSessionComplete) onSessionComplete();
              }}
              className="mt-2"
            >
              Close & Reset Table
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
}

