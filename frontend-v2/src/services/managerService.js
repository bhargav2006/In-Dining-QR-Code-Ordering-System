import apiClient from './apiClient';

export const managerService = {
  // --- Analytics Dashboard ---
  /**
   * Fetch live sales summary & key performance metrics
   * @returns {Promise<Object>} SalesSummaryDto
   */
  async getAnalytics() {
    const response = await apiClient.get('/manager/analytics/dashboard');
    return response.data || {
      todaySales: 0,
      todayOrdersCount: 0,
      yesterdaySales: 0,
      yesterdayOrdersCount: 0,
      allTimeSales: 0,
      allTimeOrdersCount: 0,
      activeTablesCount: 0,
      totalTablesCount: 0,
      pendingOrdersCount: 0,
    };
  },

  // --- Categories ---
  /**
   * Fetch all menu categories ordered by displayOrder
   * @returns {Promise<Array>} List of Category
   */
  async getCategories() {
    const response = await apiClient.get('/manager/categories');
    return response.data || [];
  },

  /**
   * Create a new category
   * @param {{ name: string, displayOrder?: number, isActive?: boolean }} dto
   * @returns {Promise<Object>} Category
   */
  async createCategory(dto) {
    if (!dto.name || !dto.name.trim()) {
      throw new Error('Category name is required');
    }
    const response = await apiClient.post('/manager/categories', {
      name: dto.name.trim(),
      displayOrder: dto.displayOrder != null ? Number(dto.displayOrder) : 0,
      isActive: dto.isActive !== false,
    });
    return response.data;
  },

  /**
   * Update an existing category
   * @param {number} id
   * @param {{ name: string, displayOrder?: number, isActive?: boolean }} dto
   * @returns {Promise<Object>} Updated Category
   */
  async updateCategory(id, dto) {
    if (!id) throw new Error('Category ID is required');
    if (!dto.name || !dto.name.trim()) {
      throw new Error('Category name is required');
    }
    const response = await apiClient.put(`/manager/categories/${id}`, {
      name: dto.name.trim(),
      displayOrder: dto.displayOrder != null ? Number(dto.displayOrder) : 0,
      isActive: dto.isActive !== false,
    });
    return response.data;
  },

  /**
   * Delete a category
   * @param {number} id
   * @returns {Promise<void>}
   */
  async deleteCategory(id) {
    if (!id) throw new Error('Category ID is required');
    await apiClient.delete(`/manager/categories/${id}`);
  },

  // --- Dishes ---
  /**
   * Fetch all dishes for the authenticated restaurant
   * @returns {Promise<Array>} List of Dish
   */
  async getDishes() {
    const response = await apiClient.get('/manager/dishes');
    return response.data || [];
  },

  /**
   * Create a new dish
   * @param {Object} dto
   * @returns {Promise<Object>} Dish
   */
  async createDish(dto) {
    if (!dto.name || !dto.name.trim()) throw new Error('Dish name is required');
    if (dto.price == null || Number(dto.price) <= 0) throw new Error('Price must be greater than zero');
    if (!dto.categoryId) throw new Error('Category selection is required');

    const response = await apiClient.post('/manager/dishes', {
      name: dto.name.trim(),
      description: dto.description?.trim() || '',
      price: Number(dto.price),
      imageUrl: dto.imageUrl?.trim() || '',
      categoryId: Number(dto.categoryId),
      isAvailable: dto.isAvailable !== false,
      preparationTimeMinutes: dto.preparationTimeMinutes ? Number(dto.preparationTimeMinutes) : 15,
      optionsJson: dto.optionsJson || null,
    });
    return response.data;
  },

  /**
   * Update an existing dish
   * @param {number} id
   * @param {Object} dto
   * @returns {Promise<Object>} Updated Dish
   */
  async updateDish(id, dto) {
    if (!id) throw new Error('Dish ID is required');
    if (!dto.name || !dto.name.trim()) throw new Error('Dish name is required');
    if (dto.price == null || Number(dto.price) <= 0) throw new Error('Price must be greater than zero');
    if (!dto.categoryId) throw new Error('Category selection is required');

    const response = await apiClient.put(`/manager/dishes/${id}`, {
      name: dto.name.trim(),
      description: dto.description?.trim() || '',
      price: Number(dto.price),
      imageUrl: dto.imageUrl?.trim() || '',
      categoryId: Number(dto.categoryId),
      isAvailable: dto.isAvailable !== false,
      preparationTimeMinutes: dto.preparationTimeMinutes ? Number(dto.preparationTimeMinutes) : 15,
      optionsJson: dto.optionsJson || null,
    });
    return response.data;
  },

  /**
   * Toggle 86 / availability for a dish
   * @param {number} id
   * @returns {Promise<Object>} Updated Dish
   */
  async toggleDishAvailability(id) {
    if (!id) throw new Error('Dish ID is required');
    const response = await apiClient.patch(`/manager/dishes/${id}/toggle-availability`);
    return response.data;
  },

  /**
   * Delete a dish
   * @param {number} id
   * @returns {Promise<void>}
   */
  async deleteDish(id) {
    if (!id) throw new Error('Dish ID is required');
    await apiClient.delete(`/manager/dishes/${id}`);
  },

  // --- Tables & QR ---
  /**
   * Fetch all tables with status and QR tokens
   * @returns {Promise<Array>} List of RestaurantTable
   */
  async getTables() {
    const response = await apiClient.get('/manager/tables');
    return response.data || [];
  },

  /**
   * Add a new dining table
   * @param {{ tableNumber: number, capacity: number }} dto
   * @returns {Promise<Object>} RestaurantTable
   */
  async createTable(dto) {
    if (!dto.tableNumber || Number(dto.tableNumber) <= 0) throw new Error('Valid table number is required');
    if (!dto.capacity || Number(dto.capacity) <= 0) throw new Error('Valid seating capacity is required');

    const response = await apiClient.post('/manager/tables', {
      tableNumber: Number(dto.tableNumber),
      capacity: Number(dto.capacity),
    });
    return response.data;
  },

  /**
   * Update table details (number or capacity)
   * @param {number} id
   * @param {{ tableNumber?: number, capacity?: number }} dto
   * @returns {Promise<Object>} Updated RestaurantTable
   */
  async updateTable(id, dto) {
    if (!id) throw new Error('Table ID is required');
    const payload = {};
    if (dto.tableNumber != null) payload.tableNumber = Number(dto.tableNumber);
    if (dto.capacity != null) payload.capacity = Number(dto.capacity);

    const response = await apiClient.put(`/manager/tables/${id}`, payload);
    return response.data;
  },

  /**
   * Delete a table
   * @param {number} id
   * @returns {Promise<void>}
   */
  async deleteTable(id) {
    if (!id) throw new Error('Table ID is required');
    await apiClient.delete(`/manager/tables/${id}`);
  },

  /**
   * Regenerate QR token for a table
   * @param {number} id
   * @returns {Promise<Object>} Updated RestaurantTable
   */
  async regenerateQrToken(id) {
    if (!id) throw new Error('Table ID is required');
    const response = await apiClient.post(`/manager/tables/${id}/regenerate-qr`);
    return response.data;
  },

  // --- Order History ---
  /**
   * Fetch consolidated order history across all dining sessions
   * @returns {Promise<Array>} List of OrderResponseDto
   */
  async getAllOrders() {
    const response = await apiClient.get('/manager/orders');
    return response.data || [];
  },
};

export default managerService;

