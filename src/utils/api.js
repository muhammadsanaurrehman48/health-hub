// API Configuration - production-safe URL resolution
const normalizeApiBase = (url) => (url || '').trim().replace(/\/$/, '');

const isLocalHostLike = (hostname) => {
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return true;
  }

  // Local network IP ranges (10.x, 192.168.x, 172.16-31.x)
  return /^(10\.\d+\.\d+\.\d+|192\.168\.\d+\.\d+|172\.(1[6-9]|2\d|3[01])\.\d+\.\d+)$/.test(hostname);
};

const API_BASE_URL = typeof window !== 'undefined'
  ? (() => {
      const envUrl = normalizeApiBase(import.meta.env.VITE_API_URL);
      if (envUrl) {
        return envUrl;
      }

      const hostname = window.location.hostname;
      const protocol = window.location.protocol;

      // For local/LAN development, target backend on the same host IP at port 5000.
      if (isLocalHostLike(hostname)) {
        return `${protocol}//${hostname}:5000/api`;
      }

      // Production fallback when env var is missing.
      // Prefer setting VITE_API_URL in Vercel to your Railway backend URL.
      return '/api';
    })()
  : 'http://localhost:5000/api';

class ApiClient {
  constructor(baseURL) {
    this.baseURL = baseURL;
  }

  getAuthToken() {
    if (typeof window !== 'undefined') {
      const user = localStorage.getItem('hms_user');
      const token = localStorage.getItem('hms_token');
      return token;
    }
    return null;
  }

  getHeaders() {
    const token = this.getAuthToken();
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'API request failed');
      }

      return data;
    } catch (error) {
      // Provide helpful network diagnostics when connection fails
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        const msg = `Cannot connect to server at ${this.baseURL}. ` +
          (window.location.hostname !== 'localhost'
            ? 'Make sure the backend is running and firewall allows port 5000 on the host machine.'
            : 'Make sure the backend server is running (cd backend && node server.js).');
        throw new Error(msg);
      }
      throw error;
    }
  }

  // Auth endpoints
  async login(email, password, role) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, role }),
    });
  }

  async signup(name, email, password, role) {
    return this.request('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, role }),
    });
  }

  async verifyToken() {
    return this.request('/auth/verify-token', {
      method: 'POST',
    });
  }

  // User endpoints
  async getUsers() {
    return this.request('/users');
  }

  async getUser(userId) {
    return this.request(`/users/${userId}`);
  }

  async createUser(data) {
    return this.request('/users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateUserProfile(userId, data) {
    return this.request(`/users/profile/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteUser(userId) {
    return this.request(`/users/${userId}`, {
      method: 'DELETE',
    });
  }

  async getDoctors() {
    return this.request('/users/role/doctor');
  }

  // Patient endpoints
  async getPatients() {
    return this.request('/patients');
  }

  async getPatient(patientId) {
    return this.request(`/patients/${patientId}`);
  }

  async searchPatients(query) {
    return this.request(`/patients/search/query?q=${query}`);
  }

  async createPatient(data) {
    return this.request('/patients', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updatePatient(patientId, data) {
    return this.request(`/patients/${patientId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Prescription endpoints
  async getPrescriptions() {
    return this.request('/prescriptions');
  }

  async getPrescription(prescriptionId) {
    return this.request(`/prescriptions/${prescriptionId}`);
  }

  async getPatientPrescriptions(patientId) {
    return this.request(`/prescriptions/patient/${patientId}`);
  }

  async createPrescription(data) {
    return this.request('/prescriptions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updatePrescription(prescriptionId, data) {
    return this.request(`/prescriptions/${prescriptionId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Appointment endpoints
  async getAppointments() {
    return this.request('/appointments');
  }

  async getAppointment(appointmentId) {
    return this.request(`/appointments/${appointmentId}`);
  }

  async getDoctorAppointments(doctorId) {
    return this.request(`/appointments/doctor/${doctorId}`);
  }

  async createAppointment(data) {
    return this.request('/appointments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateAppointment(appointmentId, data) {
    return this.request(`/appointments/${appointmentId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteAppointment(appointmentId) {
    return this.request(`/appointments/${appointmentId}`, {
      method: 'DELETE',
    });
  }

  async clearAllAppointments() {
    return this.request('/appointments/admin/clear-all', {
      method: 'DELETE',
    });
  }

  async assignTokenToAppointment(appointmentId) {
    return this.request(`/appointments/${appointmentId}/assign-token`, {
      method: 'POST',
    });
  }

  // Referral endpoints
  async getReferrals() {
    return this.request('/referrals');
  }

  async getReferral(referralId) {
    return this.request(`/referrals/${referralId}`);
  }

  async createReferral(data) {
    return this.request('/referrals', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateReferral(referralId, data) {
    return this.request(`/referrals/${referralId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteReferral(referralId) {
    return this.request(`/referrals/${referralId}`, {
      method: 'DELETE',
    });
  }

  // Lab Request endpoints
  async getLabRequests() {
    return this.request('/lab-requests');
  }

  async getLabRequest(requestId) {
    return this.request(`/lab-requests/${requestId}`);
  }

  async createLabRequest(data) {
    return this.request('/lab-requests', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateLabRequest(requestId, data) {
    return this.request(`/lab-requests/${requestId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Radiology endpoints
  async getRadiologyRequests() {
    return this.request('/radiology');
  }

  async createRadiologyRequest(data) {
    return this.request('/radiology', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateRadiologyRequest(requestId, data) {
    return this.request(`/radiology/${requestId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Pharmacy endpoints
  async getPharmacyPrescriptions() {
    return this.request('/pharmacy/prescriptions');
  }

  async getPharmacyInventory() {
    return this.request('/pharmacy/inventory');
  }

  async dispensePrescription(prescriptionId, data = {}) {
    return this.request(`/pharmacy/dispense/${prescriptionId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Nurse endpoints
  async addCareNote(data) {
    return this.request('/nurse/care-notes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getAdmittedPatients() {
    return this.request('/nurse/patients');
  }

  async createAdmission(data) {
    return this.request('/nurse/admit', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async dischargePatient(wardPatientId) {
    return this.request(`/nurse/discharge/${wardPatientId}`, {
      method: 'PUT',
    });
  }

  async getCareNotes(patientId) {
    return this.request(`/nurse/care-notes/patient/${patientId}`);
  }

  // Billing endpoints
  async getInvoices() {
    return this.request('/billing');
  }

  async getInvoice(invoiceId) {
    return this.request(`/billing/${invoiceId}`);
  }

  async createInvoice(data) {
    return this.request('/billing', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateInvoice(invoiceId, data) {
    return this.request(`/billing/${invoiceId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async getServicePricing(patientType) {
    return this.request(`/billing/pricing/${patientType}`);
  }

  // Inventory endpoints
  async getInventory() {
    return this.request('/inventory');
  }

  async addInventoryItem(data) {
    return this.request('/inventory', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateInventoryItem(itemId, data) {
    return this.request(`/inventory/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async getLowStockItems() {
    return this.request('/inventory/low-stock/list');
  }

  async getInventoryByCategory(category) {
    return this.request(`/inventory/category/${category}`);
  }

  async getInventoryByDepartment(department) {
    return this.request(`/inventory/department/${department}`);
  }

  async deleteInventoryItem(itemId) {
    return this.request(`/inventory/${itemId}`, {
      method: 'DELETE',
    });
  }

  async getLowStockAlerts() {
    return this.request('/inventory/alerts/low-stock');
  }

  async getExpiringAlerts() {
    return this.request('/inventory/alerts/expiring');
  }

  async getAlertsummary() {
    return this.request('/inventory/alerts/summary');
  }

  async markForDisposal(itemId, reason) {
    return this.request(`/inventory/mark-disposal/${itemId}`, {
      method: 'PATCH',
      body: JSON.stringify({ reason }),
    });
  }

  async getReportAnalytics() {
    return this.request('/inventory/report/analytics');
  }

  // Admin endpoints
  async getAdminStats() {
    return this.request('/admin/stats');
  }

  async getActivities() {
    return this.request('/admin/activities');
  }

  async getHealthStatus() {
    return this.request('/admin/health');
  }

  async getBillingOverview(period) {
    const params = period ? `?period=${period}` : '';
    return this.request(`/admin/billing-overview${params}`);
  }

  async dailyResetAppointments() {
    return this.request('/appointments/admin/daily-reset', {
      method: 'POST',
    });
  }

  async getReports(period = '6months') {
    return this.request(`/admin/reports?period=${period}`);
  }

  async getAnalyticsData(period = '6months') {
    return this.request(`/admin/analytics?period=${period}`);
  }

  // Admin full-access endpoints
  async getAdminPatients(period) {
    const params = period ? `?period=${period}` : '';
    return this.request(`/admin/patients${params}`);
  }

  async getAdminAppointments(period) {
    const params = period ? `?period=${period}` : '';
    return this.request(`/admin/appointments${params}`);
  }

  async getAdminPrescriptions(period) {
    const params = period ? `?period=${period}` : '';
    return this.request(`/admin/prescriptions${params}`);
  }

  async getAdminLabRequests(period) {
    const params = period ? `?period=${period}` : '';
    return this.request(`/admin/lab-requests${params}`);
  }

  async getAdminRadiologyRequests(period) {
    const params = period ? `?period=${period}` : '';
    return this.request(`/admin/radiology-requests${params}`);
  }

  async getAdminInvoices(period) {
    const params = period ? `?period=${period}` : '';
    return this.request(`/admin/invoices${params}`);
  }

  async getAdminSummary(period = 'today') {
    return this.request(`/admin/summary?period=${period}`);
  }

  async downloadReport(reportType, format = 'csv') {
    const token = this.getAuthToken();
    const url = `${this.baseURL}/admin/download-report?type=${reportType}&format=${format}`;
    
    try {
      const headers = {
        ...(token && { Authorization: `Bearer ${token}` }),
      };
      
      const response = await fetch(url, { headers });
      
      if (!response.ok) {
        throw new Error('Failed to download report');
      }
      
      const blob = await response.blob();
      return blob;
    } catch (error) {
      console.error('Download error:', error);
      throw error;
    }
  }

  async updateUser(userId, data) {
    return this.request(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Department endpoints
  async getDepartments() {
    return this.request('/departments');
  }

  async getDepartment(departmentId) {
    return this.request(`/departments/${departmentId}`);
  }

  async createDepartment(data) {
    return this.request('/departments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateDepartment(departmentId, data) {
    return this.request(`/departments/${departmentId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteDepartment(departmentId) {
    return this.request(`/departments/${departmentId}`, {
      method: 'DELETE',
    });
  }

  // Queue endpoints (updated for room-based system)
  async getQueueByRoom(roomNo) {
    return this.request(`/queue/room/${roomNo}`);
  }

  async getAllQueues() {
    return this.request('/queue');
  }

  async moveToNextPatient(roomNo) {
    return this.request(`/queue/room/${roomNo}/next-patient`, {
      method: 'POST',
    });
  }

  async completeAppointment(roomNo, appointmentId) {
    return this.request(`/queue/room/${roomNo}/complete-appointment/${appointmentId}`, {
      method: 'POST',
    });
  }

  async skipPatient(roomNo, patientIndex) {
    return this.request(`/queue/room/${roomNo}/skip-patient/${patientIndex}`, {
      method: 'POST',
    });
  }

  async updateCurrentToken(roomNo, tokenNo) {
    return this.request(`/queue/${roomNo}/current-token`, {
      method: 'PUT',
      body: JSON.stringify({ tokenNo }),
    });
  }

  // Vitals endpoints
  async recordVitals(data) {
    return this.request('/vitals', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getPatientVitals(patientId) {
    return this.request(`/vitals/patient/${patientId}`);
  }

  async getLatestVitals(patientId) {
    return this.request(`/vitals/patient/${patientId}/latest`);
  }

  async getAppointmentVitals(appointmentId) {
    return this.request(`/vitals/appointment/${appointmentId}`);
  }

  async updateVitals(vitalId, data) {
    return this.request(`/vitals/${vitalId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Notifications endpoints
  async getNotifications(page = 1, limit = 10, read = null) {
    const params = new URLSearchParams({ page, limit });
    if (read !== null) {
      params.append('read', read);
    }
    return this.request(`/notifications?${params.toString()}`);
  }

  async getUnreadNotificationCount() {
    return this.request('/notifications/count/unread');
  }

  async markNotificationAsRead(notificationId) {
    return this.request(`/notifications/${notificationId}/read`, {
      method: 'PUT',
    });
  }

  async markAllNotificationsAsRead() {
    return this.request('/notifications/read-all', {
      method: 'PUT',
    });
  }

  async deleteNotification(notificationId) {
    return this.request(`/notifications/${notificationId}`, {
      method: 'DELETE',
    });
  }
}

export default new ApiClient(API_BASE_URL);
