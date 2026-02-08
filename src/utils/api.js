// API Configuration
const API_BASE_URL = typeof window !== 'undefined' 
  ? (import.meta.env.VITE_API_URL || 'http://localhost:5000/api')
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
      console.error('API Error:', error);
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
  async getUser(userId) {
    return this.request(`/users/${userId}`);
  }

  async updateUserProfile(userId, data) {
    return this.request(`/users/profile/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
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

  async dispensePrescription(prescriptionId) {
    return this.request(`/pharmacy/dispense/${prescriptionId}`, {
      method: 'PUT',
    });
  }

  // Nurse endpoints
  async recordVitals(data) {
    return this.request('/nurse/vitals', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getPatientVitals(patientId) {
    return this.request(`/nurse/vitals/patient/${patientId}`);
  }

  async addCareNote(data) {
    return this.request('/nurse/care-notes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getAdmittedPatients() {
    return this.request('/nurse/patients');
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
    return this.request('/inventory/low-stock');
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

  async getBillingOverview() {
    return this.request('/admin/billing-overview');
  }

  async getReports() {
    return this.request('/admin/reports');
  }

  // Department endpoints
  async getDepartments() {
    return this.request('/departments');
  }

  // Queue endpoints
  async getQueueData(departmentId) {
    return this.request(`/queue/${departmentId}`);
  }

  async updateCurrentToken(departmentId, tokenNo) {
    return this.request(`/queue/${departmentId}/current-token`, {
      method: 'PUT',
      body: JSON.stringify({ tokenNo }),
    });
  }
}

export default new ApiClient(API_BASE_URL);
