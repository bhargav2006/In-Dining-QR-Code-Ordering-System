import apiClient from './apiClient';

export const kitchenService = {
  /**
   * Fetch active kitchen orders (statuses: PLACED, PREPARING, READY)
   * Role required: ROLE_KITCHEN or ROLE_ADMIN
   * @param {number|null} restaurantId (Optional query param, backend extracts tenant from JWT)
   * @returns {Promise<Array>} List of OrderResponseDto
   */
  async getOrders(restaurantId = null) {
    const params = restaurantId ? { restaurantId } : {};
    const response = await apiClient.get('/kitchen/orders', { params });
    return response.data || [];
  },

  /**
   * Update the kitchen status of an order
   * Allowed statuses: PREPARING, READY
   * @param {number} orderId
   * @param {'PREPARING'|'READY'} status
   * @returns {Promise<Object>} Updated OrderResponseDto
   */
  async updateOrderStatus(orderId, status) {
    if (!orderId) {
      throw new Error('Order ID is required to update kitchen status');
    }
    if (!status || !['PREPARING', 'READY'].includes(status)) {
      throw new Error(`Invalid kitchen status "${status}". Allowed values: PREPARING, READY`);
    }

    const response = await apiClient.patch(
      `/kitchen/orders/${orderId}/status`,
      null,
      {
        params: { status },
      }
    );
    return response.data;
  },
};

export default kitchenService;

