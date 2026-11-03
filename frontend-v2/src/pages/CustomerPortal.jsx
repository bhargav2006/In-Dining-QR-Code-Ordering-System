import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useTableSession } from '../context/TableSessionContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import useMenu from '../hooks/useMenu';
import useOrderTracker from '../hooks/useOrderTracker';
import customerService from '../services/customerService';

import CustomerHeader from '../components/customer/CustomerHeader';
import CategoryBar from '../components/customer/CategoryBar';
import SearchBar from '../components/customer/SearchBar';
import DishCard from '../components/customer/DishCard';
import DishModal from '../components/customer/DishModal';
import CartFloatingBar from '../components/customer/CartFloatingBar';
import CartDrawer from '../components/customer/CartDrawer';
import OrderTrackerModal from '../components/customer/OrderTrackerModal';
import AssistanceModal from '../components/customer/AssistanceModal';
import BillReceiptModal from '../components/customer/BillReceiptModal';
import OccupiedLockedBanner from '../components/customer/OccupiedLockedBanner';
import { Loader2, AlertCircle, Utensils } from 'lucide-react';

export default function CustomerPortal() {
  const { tableNumber: paramTableNumber, restaurantSlug: paramRestaurantSlug, qrToken: paramQrToken } = useParams();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  const queryQrToken = searchParams.get('qrToken') || paramQrToken;
  const queryRestaurantId = searchParams.get('restaurantId');
  const targetTableNumber = paramTableNumber || searchParams.get('table') || (queryQrToken ? null : '1');
  const targetSlug = paramRestaurantSlug || searchParams.get('restaurantSlug') || 'gourmet-bistro';

  // Contexts
  const {
    session,
    sessionToken,
    tableNumber,
    restaurant,
    isLoading: isSessionLoading,
    isOccupiedLocked,
    error: sessionError,
    initSession,
    unlockWithToken,
    clearSession,
  } = useTableSession();

  const {
    items: cartItems,
    itemCount,
    subtotal,
    taxEstimate,
    totalEstimate,
    orderNotes,
    setOrderNotes,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
  } = useCart();

  // Menu hook
  const {
    categories,
    filteredDishes,
    selectedCategoryId,
    setSelectedCategoryId,
    searchQuery,
    setSearchQuery,
    dietaryFilter,
    setDietaryFilter,
    isLoading: isMenuLoading,
    error: menuError,
  } = useMenu({
    restaurantId: restaurant?.id || queryRestaurantId,
    restaurantSlug: restaurant?.slug || targetSlug,
  });

  // Orders & Tracker hook
  const {
    orders,
    receipt,
    activeOrdersCount,
    isLoading: isOrdersLoading,
    isCancelling,
    cancelOrder,
    refreshOrders,
    refreshReceipt,
  } = useOrderTracker(sessionToken);

  // Modal open states
  const [selectedDishDetail, setSelectedDishDetail] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isOrdersOpen, setIsOrdersOpen] = useState(false);
  const [isAssistanceOpen, setIsAssistanceOpen] = useState(false);
  const [isBillOpen, setIsBillOpen] = useState(false);

  // Action loaders
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [isSubmittingAssistance, setIsSubmittingAssistance] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Initialize table session on component mount or URL parameter change
  useEffect(() => {
    initSession({
      qrToken: queryQrToken,
      tableNumber: targetTableNumber,
      restaurantId: queryRestaurantId,
      restaurantSlug: targetSlug,
    }).catch((err) => {
      console.warn('Initial session connection error:', err);
    });
  }, [initSession, queryQrToken, targetTableNumber, queryRestaurantId, targetSlug]);

  // Order submission
  const handleSubmitOrder = async () => {
    if (!sessionToken) {
      toast('Active table session required to submit orders', 'error');
      return;
    }
    if (cartItems.length === 0) return;

    setIsSubmittingOrder(true);
    try {
      const payload = {
        sessionToken,
        items: cartItems.map((it) => ({
          dishId: it.dishId,
          quantity: it.quantity,
          specialInstructions: it.specialInstructions || undefined,
        })),
        notes: orderNotes.trim() || undefined,
      };

      await customerService.createOrder(payload);
      clearCart();
      setIsCartOpen(false);
      toast('Order sent to kitchen! Preparation will begin shortly.', 'success');
      refreshOrders();
      refreshReceipt();
      setIsOrdersOpen(true);
    } catch (err) {
      toast(err.message || 'Failed to submit order', 'error');
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  // Order cancellation
  const handleCancelOrder = async (orderId) => {
    try {
      await cancelOrder(orderId);
      toast('Order cancelled successfully', 'info');
    } catch (err) {
      toast(err.message || 'Cannot cancel order (already in preparation)', 'error');
    }
  };

  // Waiter Assistance
  const handleSubmitAssistance = async ({ requestType, note }) => {
    if (!sessionToken) {
      toast('Active table session required', 'error');
      return;
    }
    setIsSubmittingAssistance(true);
    try {
      await customerService.requestAssistance({
        sessionToken,
        requestType,
        note,
      });
      toast('Assistance requested. Staff notified!', 'success');
    } catch (err) {
      toast(err.message || 'Failed to send assistance request', 'error');
    } finally {
      setIsSubmittingAssistance(false);
    }
  };

  // Bill payment
  const handleProcessPayment = async (paymentData) => {
    if (!sessionToken) throw new Error('No active table session');
    setIsProcessingPayment(true);
    try {
      const result = await customerService.processPayment({
        ...paymentData,
        sessionToken,
      });
      if (paymentData.paymentMethod === 'CASH') {
        toast('Cash collection request sent to waiter', 'info');
      } else {
        toast('Simulated payment confirmed! Thank you.', 'success');
      }
      refreshOrders();
      refreshReceipt();
      return result;
    } catch (err) {
      toast(err.message || 'Payment processing failed', 'error');
      throw err;
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // Calculate dish count per category for pills
  const dishCountsByCategory = React.useMemo(() => {
    const counts = {};
    for (const d of filteredDishes) {
      const catId = d.category?.id || d.categoryId;
      if (catId) counts[catId] = (counts[catId] || 0) + 1;
    }
    return counts;
  }, [filteredDishes]);

  const currentTableNumber = session?.tableNumber || paramTableNumber || searchParams.get('table') || '1';

  // Loading Screen
  if (isSessionLoading && !session) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-3" />
        <h2 className="text-base font-bold">Connecting to Table #{targetTableNumber}...</h2>
        <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
          Retrieving menu and active dining session
        </p>
      </div>
    );
  }

  // Occupied & Locked Screen
  if (isOccupiedLocked) {
    return (
      <div className="min-h-screen flex flex-col">
        <CustomerHeader
          restaurantName={restaurant?.name || 'Gourmet Bistro'}
          tableNumber={currentTableNumber}
          onOpenAssistance={() => setIsAssistanceOpen(true)}
          onOpenOrders={() => {}}
        />
        <main className="flex-1 flex items-center justify-center">
          <OccupiedLockedBanner
            tableNumber={currentTableNumber}
            restaurantName={restaurant?.name || 'Gourmet Bistro'}
            onUnlockWithToken={(token) =>
              unlockWithToken({
                token,
                tableNumber: currentTableNumber,
                restaurantSlug: targetSlug,
                qrToken: queryQrToken,
              })
            }
            onCallWaiter={() => setIsAssistanceOpen(true)}
          />
        </main>
        <AssistanceModal
          isOpen={isAssistanceOpen}
          onClose={() => setIsAssistanceOpen(false)}
          onSubmitAssistance={handleSubmitAssistance}
          isSubmitting={isSubmittingAssistance}
          tableNumber={currentTableNumber}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col pb-24" style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text)' }}>
      {/* Top Header */}
      <CustomerHeader
        restaurantName={restaurant?.name || 'Gourmet Bistro'}
        tableNumber={tableNumber || targetTableNumber}
        activeOrdersCount={activeOrdersCount}
        onOpenAssistance={() => setIsAssistanceOpen(true)}
        onOpenOrders={() => setIsOrdersOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-4xl mx-auto pt-2">
        {/* Category Navigation Pills */}
        <CategoryBar
          categories={categories}
          selectedCategoryId={selectedCategoryId}
          onSelectCategory={setSelectedCategoryId}
          dishCountsByCategory={dishCountsByCategory}
        />

        {/* Search & Dietary Filters */}
        <SearchBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          dietaryFilter={dietaryFilter}
          onDietaryFilterChange={setDietaryFilter}
        />

        {/* Menu Items Grid */}
        <div className="px-4 sm:px-6">
          {isMenuLoading ? (
            <div className="py-20 flex flex-col items-center justify-center text-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary mb-2" />
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                Curating menu dishes...
              </p>
            </div>
          ) : menuError ? (
            <div
              className="p-6 rounded-2xl border text-center my-8"
              style={{
                backgroundColor: 'var(--color-surface)',
                borderColor: 'var(--color-error-border)',
              }}
            >
              <AlertCircle className="w-8 h-8 mx-auto mb-2 text-rose-500" />
              <h3 className="text-sm font-bold text-rose-500 mb-1">Menu Unavailable</h3>
              <p className="text-xs max-w-sm mx-auto" style={{ color: 'var(--color-text-muted)' }}>
                {menuError}
              </p>
            </div>
          ) : filteredDishes.length === 0 ? (
            <div
              className="py-16 text-center rounded-2xl border my-4"
              style={{
                backgroundColor: 'var(--color-surface)',
                borderColor: 'var(--color-border)',
              }}
            >
              <Utensils className="w-8 h-8 mx-auto mb-2 opacity-30" style={{ color: 'var(--color-text-muted)' }} />
              <h3 className="text-sm font-bold mb-1">No dishes match your selection</h3>
              <p className="text-xs max-w-xs mx-auto mb-3" style={{ color: 'var(--color-text-muted)' }}>
                Try adjusting your search keyword or switching dietary filter.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setDietaryFilter('ALL');
                  setSelectedCategoryId(null);
                }}
                className="text-xs font-semibold text-primary hover:underline"
              >
                Reset all filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
              {filteredDishes.map((dish) => {
                // Find matching cart item quantity
                const cartItem = cartItems.find((ci) => ci.dishId === dish.id);
                const cartQty = cartItem ? cartItem.quantity : 0;
                const cartIndex = cartItems.findIndex((ci) => ci.dishId === dish.id);

                return (
                  <DishCard
                    key={dish.id}
                    dish={dish}
                    cartQuantity={cartQty}
                    onAddToCart={(d) => addItem(d, 1)}
                    onUpdateQuantity={(newQty) => updateQuantity(cartIndex, newQty)}
                    onOpenDetail={(d) => setSelectedDishDetail(d)}
                  />
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Floating Bottom Cart Bar */}
      <CartFloatingBar
        itemCount={itemCount}
        subtotal={subtotal}
        onOpenCart={() => setIsCartOpen(true)}
      />

      {/* Modals & Drawers */}
      <DishModal
        dish={selectedDishDetail}
        isOpen={Boolean(selectedDishDetail)}
        onClose={() => setSelectedDishDetail(null)}
        onAddToCart={addItem}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        subtotal={subtotal}
        taxEstimate={taxEstimate}
        totalEstimate={totalEstimate}
        orderNotes={orderNotes}
        onSetOrderNotes={setOrderNotes}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeItem}
        onClearCart={clearCart}
        onSubmitOrder={handleSubmitOrder}
        isSubmitting={isSubmittingOrder}
        tableNumber={tableNumber || targetTableNumber}
      />

      <OrderTrackerModal
        isOpen={isOrdersOpen}
        onClose={() => setIsOrdersOpen(false)}
        orders={orders}
        isLoading={isOrdersLoading}
        isCancelling={isCancelling}
        onCancelOrder={handleCancelOrder}
        onRefresh={refreshOrders}
        onOpenBill={() => {
          refreshReceipt();
          setIsBillOpen(true);
        }}
        tableNumber={tableNumber || targetTableNumber}
      />

      <AssistanceModal
        isOpen={isAssistanceOpen}
        onClose={() => setIsAssistanceOpen(false)}
        onSubmitAssistance={handleSubmitAssistance}
        isSubmitting={isSubmittingAssistance}
        tableNumber={tableNumber || targetTableNumber}
      />

      <BillReceiptModal
        isOpen={isBillOpen}
        onClose={() => setIsBillOpen(false)}
        receipt={receipt}
        onRefresh={refreshReceipt}
        onProcessPayment={handleProcessPayment}
        isProcessing={isProcessingPayment}
        tableNumber={tableNumber || targetTableNumber}
        onSessionComplete={() => {
          clearSession();
          toast('Table session completed and liberated', 'info');
        }}
      />
    </div>
  );
}

