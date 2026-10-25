const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000').replace(/\/$/, '') + '/api';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('qzero_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data?: T; error?: string }> {
  try {
    const isFormData = options.body instanceof FormData;
    const headers: Record<string, string> = {
      ...getAuthHeader(),
      ...(options.headers as Record<string, string>),
    };

    if (!isFormData && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const json = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: json.error || `HTTP error ${response.status}`,
      };
    }

    return { success: true, data: json };
  } catch (err: any) {
    console.error(`API Error on ${endpoint}:`, err);
    return {
      success: false,
      error: err.message || 'Cannot connect to QueueZero backend server',
    };
  }
}

// Auth API
export const authApi = {
  login: (data: { email: string; password: string }) =>
    apiRequest('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  register: (data: any) =>
    apiRequest('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  demoLogin: (role: 'STUDENT' | 'ADMIN' | 'OPERATOR') =>
    apiRequest('/auth/demo-login', { method: 'POST', body: JSON.stringify({ role }) }),
  getProfile: () =>
    apiRequest('/auth/me', { method: 'GET' }),
  verifyOtp: (email: string, otp: string) =>
    apiRequest('/auth/verify-otp', { method: 'POST', body: JSON.stringify({ email, otp }) }),
};

// Documents API
export const documentsApi = {
  upload: (formData: FormData) =>
    apiRequest('/documents/upload', { method: 'POST', body: formData }),
  getAll: () =>
    apiRequest('/documents', { method: 'GET' }),
  getById: (id: string) =>
    apiRequest(`/documents/${id}`, { method: 'GET' }),
  updateSettings: (id: string, settings: any) =>
    apiRequest(`/documents/${id}/settings`, { method: 'PUT', body: JSON.stringify(settings) }),
  delete: (id: string) =>
    apiRequest(`/documents/${id}`, { method: 'DELETE' }),
};

// Kiosks API
export const kiosksApi = {
  getAll: () =>
    apiRequest('/kiosks', { method: 'GET' }),
  getById: (id: string) =>
    apiRequest(`/kiosks/${id}`, { method: 'GET' }),
  getSlots: (kioskId: string, date?: string) =>
    apiRequest(`/slots/kiosk/${kioskId}${date ? `?date=${date}` : ''}`, { method: 'GET' }),
  updateTelemetry: (id: string, data: any) =>
    apiRequest(`/kiosks/${id}/telemetry`, { method: 'PATCH', body: JSON.stringify(data) }),
};

// Orders API
export const ordersApi = {
  create: (data: any) =>
    apiRequest('/orders/create', { method: 'POST', body: JSON.stringify(data) }),
  getAll: (filters?: { status?: string; search?: string }) => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.search) params.append('search', filters.search);
    return apiRequest(`/orders?${params.toString()}`, { method: 'GET' });
  },
  getDashboardSummary: () =>
    apiRequest('/orders/dashboard-summary', { method: 'GET' }),
  getByIdOrCode: (identifier: string) =>
    apiRequest(`/orders/${identifier}`, { method: 'GET' }),
};

// Payments API
export const paymentsApi = {
  pay: (data: { orderId: string; method?: string }) =>
    apiRequest('/payments/pay', { method: 'POST', body: JSON.stringify(data) }),
  topUpWallet: (amount: number) =>
    apiRequest('/payments/top-up-wallet', { method: 'POST', body: JSON.stringify({ amount }) }),
  getHistory: () =>
    apiRequest('/payments/history', { method: 'GET' }),
};

// Verification & Operator API
export const verificationApi = {
  lookup: (trackingCode: string) =>
    apiRequest(`/verification/lookup/${trackingCode}`, { method: 'GET' }),
  confirmHandover: (data: any) =>
    apiRequest('/verification/confirm-handover', { method: 'POST', body: JSON.stringify(data) }),
};

// Notifications API
export const notificationsApi = {
  getAll: () =>
    apiRequest('/notifications', { method: 'GET' }),
  markAsRead: (id: string) =>
    apiRequest(`/notifications/${id}/read`, { method: 'PATCH' }),
  markAllAsRead: () =>
    apiRequest('/notifications/read-all', { method: 'PATCH' }),
};

// Support API
export const supportApi = {
  submitTicket: (data: any) =>
    apiRequest('/support/tickets', { method: 'POST', body: JSON.stringify(data) }),
  getMyTickets: () =>
    apiRequest('/support/tickets', { method: 'GET' }),
  getAdminTickets: () =>
    apiRequest('/support/admin/tickets', { method: 'GET' }),
  respondTicket: (id: string, data: any) =>
    apiRequest(`/support/admin/tickets/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
};

// Admin API
export const adminApi = {
  getAnalytics: () =>
    apiRequest('/admin/analytics', { method: 'GET' }),
  getQueue: () =>
    apiRequest('/admin/queue', { method: 'GET' }),
  updateOrderStatus: (id: string, status: string) =>
    apiRequest(`/admin/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  rerouteOrder: (id: string, newKioskId: string, reason?: string) =>
    apiRequest(`/admin/orders/${id}/reroute`, { method: 'POST', body: JSON.stringify({ newKioskId, reason }) }),
  getUsers: () =>
    apiRequest('/admin/users', { method: 'GET' }),
};
