import apiClient from './apiClient';

export const waiterService = {
  /**
   * Fetch all tables for the authenticated staff member's restaurant
   * Requires: ROLE_WAITER or ROLE_ADMIN
   * @returns {Promise<Array>} List of RestaurantTable
   */
  async getTables() {
    const response = await apiClient.get('/waiter/tables');
    return response.data || [];
  },

  /**
   * Update table status
   * Allowed statuses: AVAILABLE, OCCUPIED, BILL_REQUESTED, CLEANING_NEEDED
   * @param {number} tableId
   * @param {'AVAILABLE'|'OCCUPIED'|'BILL_REQUESTED'|'CLEANING_NEEDED'} status
   * @returns {Promise<Object>} Updated RestaurantTable
   */
  async updateTableStatus(tableId, status) {
    if (!tableId) throw new Error('Table ID is required');
    if (!status) throw new Error('Status is required');

    const response = await apiClient.patch(`/waiter/tables/${tableId}/status`, null, {
      params: { status },
    });
    return response.data;
  },

  /**
   * Fetch kitchen-ready orders waiting to be served
   * Requires: ROLE_WAITER or ROLE_ADMIN
   * @returns {Promise<Array>} List of OrderResponseDto
   */
  async getReadyOrders() {
    const response = await apiClient.get('/waiter/orders/ready');
    return response.data || [];
  },

  /**
   * Mark a ready order as served to guests
   * @param {number} orderId
   * @returns {Promise<Object>} Updated OrderResponseDto (status: SERVED)
   */
  async markOrderServed(orderId) {
    if (!orderId) throw new Error('Order ID is required');

    const response = await apiClient.patch(`/waiter/orders/${orderId}/serve`);
    return response.data;
  },

  /**
   * Fetch pending customer assistance calls
   * Requires: ROLE_WAITER or ROLE_ADMIN
   * @returns {Promise<Array>} List of AssistanceRequestDto
   */
  async getAssistanceRequests() {
    const response = await apiClient.get('/waiter/assistance');
    return response.data || [];
  },

  /**
   * Mark an assistance call as resolved
   * @param {number} requestId
   * @returns {Promise<Object>} Updated AssistanceRequestDto (status: RESOLVED)
   */
  async resolveAssistance(requestId) {
    if (!requestId) throw new Error('Request ID is required');

    const response = await apiClient.patch(`/waiter/assistance/${requestId}/resolve`);
    return response.data;
  },

  /**
   * Checkout and liberate a table: closes active sessions, marks uncancelled orders COMPLETED,
   * and resets table status to AVAILABLE
   * @param {number} tableId
   * @returns {Promise<Object>} Closed TableSession
   */
  async checkoutTable(tableId) {
    if (!tableId) throw new Error('Table ID is required');

    const response = await apiClient.post(`/waiter/tables/${tableId}/checkout`);
    return response.data;
  },

  /**
   * Helper to retrieve live bill receipt for a table session during checkout preview
   * @param {string} sessionToken
   * @returns {Promise<Object>} BillReceiptDto
   */
  async getBillReceipt(sessionToken) {
    if (!sessionToken) return null;
    const response = await apiClient.get(`/customer/bill/receipt/${sessionToken}`);
    return response.data;
  },
};

export default waiterService;

