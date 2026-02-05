// API Service for Party Now App
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = {
  // Store token in localStorage
  setToken(token) {
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  },

  getToken() {
    return localStorage.getItem('auth_token');
  },

  // Get authorization header
  getHeaders() {
    const token = this.getToken();
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  },

  // Authentication
  async signup(username, password) {
    const response = await fetch(`${API_URL}/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await response.json();
    if (data.token) {
      this.setToken(data.token);
    }
    return data;
  },

  async login(username, password) {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await response.json();
    if (data.token) {
      this.setToken(data.token);
    }
    return data;
  },

  logout() {
    this.setToken(null);
  },

  // Parties
  async getParties() {
    const response = await fetch(`${API_URL}/parties`, {
      method: 'GET',
      headers: this.getHeaders()
    });
    if (!response.ok) {
      if (response.status === 401) {
        this.setToken(null);
        throw new Error('Unauthorized');
      }
      throw new Error('Failed to fetch parties');
    }
    return await response.json();
  },

  async createParty(partyId, name, startDate, endDate, menuItems) {
    const response = await fetch(`${API_URL}/parties`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ partyId, name, startDate, endDate, menuItems })
    });
    if (!response.ok) {
      throw new Error('Failed to create party');
    }
    return await response.json();
  },

  async updateParty(partyId, selections) {
    const response = await fetch(`${API_URL}/parties/${partyId}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify({ selections })
    });
    if (!response.ok) {
      throw new Error('Failed to update party');
    }
    return await response.json();
  },

  async deleteParty(partyId) {
    const response = await fetch(`${API_URL}/parties/${partyId}`, {
      method: 'DELETE',
      headers: this.getHeaders()
    });
    if (!response.ok) {
      throw new Error('Failed to delete party');
    }
    return await response.json();
  }
};

export default api;
