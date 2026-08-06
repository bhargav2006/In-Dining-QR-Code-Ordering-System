import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request Interceptor: Attach security Bearer auth token if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response Interceptor: Handle errors cleanly
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Unauthorized token session expired
      localStorage.removeItem('authToken');
      sessionStorage.removeItem('authToken');
    }
    const message = error.response?.data?.message || error.message || 'API Request Failed';
    return Promise.reject(new Error(message));
  }
);

export const customerApi = {
  startSession: async (tableNumber, qrToken, sessionToken) => {
    const res = await api.post('/customer/session/start', { tableNumber, qrToken, sessionToken });
    return res.data;
  },

  getCategories: async () => {
    const res = await api.get('/customer/categories');
    return res.data;
  },

  getMenu: async (categoryId, search) => {
    const res = await api.get('/customer/menu', { params: { categoryId, search } });
    return res.data;
  },

  createOrder: async (sessionToken, items, notes) => {
    const res = await api.post('/customer/orders', { sessionToken, items, notes });
    return res.data;
  },

  getSessionOrders: async (sessionToken) => {
    const res = await api.get(`/customer/orders/session/${sessionToken}`);
    return res.data;
  },

  requestAssistance: async (sessionToken, requestType, note) => {
    const res = await api.post('/customer/assistance', { sessionToken, requestType, note });
    return res.data;
  },

  getBillReceipt: async (sessionToken) => {
    const res = await api.get(`/customer/bill/receipt/${sessionToken}`);
    return res.data;
  },

  processPayment: async (paymentData) => {
    const res = await api.post('/customer/bill/pay', paymentData);
    return res.data;
  },

  cancelOrder: async (orderId, sessionToken) => {
    const res = await api.delete(`/customer/orders/${orderId}`, { params: { sessionToken } });
    return res.data;
  }
};

export const kitchenApi = {
  getOrders: async () => {
    const res = await api.get('/kitchen/orders');
    return res.data;
  },

  updateStatus: async (orderId, status) => {
    const res = await api.patch(`/kitchen/orders/${orderId}/status`, null, { params: { status } });
    return res.data;
  }
};

export const waiterApi = {
  getTables: async () => {
    const res = await api.get('/waiter/tables');
    return res.data;
  },

  updateTableStatus: async (tableId, status) => {
    const res = await api.patch(`/waiter/tables/${tableId}/status`, null, { params: { status } });
    return res.data;
  },

  getAssistanceRequests: async () => {
    const res = await api.get('/waiter/assistance');
    return res.data;
  },

  resolveAssistance: async (requestId) => {
    const res = await api.patch(`/waiter/assistance/${requestId}/resolve`);
    return res.data;
  },

  getReadyOrders: async () => {
    const res = await api.get('/waiter/orders/ready');
    return res.data;
  },

  markServed: async (orderId) => {
    const res = await api.patch(`/waiter/orders/${orderId}/serve`);
    return res.data;
  },

  checkoutTable: async (tableId) => {
    const res = await api.post(`/waiter/tables/${tableId}/checkout`);
    return res.data;
  }
};

export const managerApi = {
  getDashboard: async () => {
    const res = await api.get('/manager/analytics/dashboard');
    return res.data;
  },

  getCategories: async () => {
    const res = await api.get('/manager/categories');
    return res.data;
  },

  saveCategory: async (category) => {
    if (category.id) {
      const res = await api.put(`/manager/categories/${category.id}`, category);
      return res.data;
    }
    const res = await api.post('/manager/categories', category);
    return res.data;
  },

  deleteCategory: async (id) => {
    await api.delete(`/manager/categories/${id}`);
  },

  getDishes: async () => {
    const res = await api.get('/manager/dishes');
    return res.data;
  },

  saveDish: async (dish) => {
    if (dish.id) {
      const res = await api.put(`/manager/dishes/${dish.id}`, dish);
      return res.data;
    }
    const res = await api.post('/manager/dishes', dish);
    return res.data;
  },

  toggleAvailability: async (id) => {
    const res = await api.patch(`/manager/dishes/${id}/toggle-availability`);
    return res.data;
  },

  deleteDish: async (id) => {
    await api.delete(`/manager/dishes/${id}`);
  },

  getTables: async () => {
    const res = await api.get('/manager/tables');
    return res.data;
  },

  saveTable: async (table) => {
    if (table.id) {
      const res = await api.put(`/manager/tables/${table.id}`, table);
      return res.data;
    }
    const res = await api.post('/manager/tables', table);
    return res.data;
  },

  deleteTable: async (id) => {
    await api.delete(`/manager/tables/${id}`);
  },

  regenerateQr: async (id) => {
    const res = await api.post(`/manager/tables/${id}/regenerate-qr`);
    return res.data;
  },

  getAllOrders: async () => {
    const res = await api.get('/manager/orders');
    return res.data;
  }
};

export const authApi = {
  login: async (username, password) => {
    const res = await api.post('/auth/login', { username, password });
    if (res.data && res.data.token) {
      localStorage.setItem('authToken', res.data.token);
    }
    return res.data;
  }
};
