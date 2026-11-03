import apiClient from './apiClient';

export const customerService = {
  /**
   * Start or resume a dine-in table session
   * @param {Object} params - { qrToken, tableNumber, restaurantId, restaurantSlug, sessionToken }
   */
  startSession: async (params) => {
    const response = await apiClient.post('/customer/session/start', params);
    return response.data;
  },

  /**
   * Get active menu categories for restaurant
   */
  getCategories: async ({ restaurantId, restaurantSlug } = {}) => {
    const response = await apiClient.get('/customer/categories', {
      params: { restaurantId, restaurantSlug },
    });
    return response.data;
  },

  /**
   * Get available menu dishes with optional filters
   */
  getMenu: async ({ categoryId, search, restaurantId, restaurantSlug } = {}) => {
    const response = await apiClient.get('/customer/menu', {
      params: { categoryId, search, restaurantId, restaurantSlug },
    });
    return response.data;
  },

  /**
   * Place a new dine-in order
   * @param {Object} orderData - { sessionToken, items: [{ dishId, quantity, specialInstructions }], notes }
   */
  createOrder: async (orderData) => {
    const response = await apiClient.post('/customer/orders', orderData);
    return response.data;
  },

  /**
   * Retrieve all orders associated with the active session
   */
  getSessionOrders: async (sessionToken) => {
    const response = await apiClient.get(`/customer/orders/session/${sessionToken}`);
    return response.data;
  },

  /**
   * Send a waiter assistance request
   * @param {Object} data - { sessionToken, requestType: ('WATER'|'BILL_REQUEST'|'WAITER_HELP'|'CLEAN_TABLE'), note }
   */
  requestAssistance: async (data) => {
    const response = await apiClient.post('/customer/assistance', data);
    return response.data;
  },

  /**
   * Generate or fetch itemized receipt for current session
   */
  getBillReceipt: async (sessionToken) => {
    const response = await apiClient.get(`/customer/bill/receipt/${sessionToken}`);
    return response.data;
  },

  /**
   * Process simulated bill payment
   * @param {Object} paymentData - { sessionToken, customerName, phoneNumber, email, rating, reviewComments, paymentMethod: ('CASH'|'CARD'|'UPI_QR') }
   */
  processPayment: async (paymentData) => {
    const response = await apiClient.post('/customer/bill/pay', paymentData);
    return response.data;
  },

  /**
   * Cancel an order (permitted only if status is PLACED)
   */
  cancelOrder: async (orderId, sessionToken) => {
    const response = await apiClient.delete(`/customer/orders/${orderId}`, {
      params: { sessionToken },
    });
    return response.data;
  },
};

export default customerService;

