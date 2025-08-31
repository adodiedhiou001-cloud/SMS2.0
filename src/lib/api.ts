import axios, { AxiosInstance, AxiosResponse } from 'axios';
import Cookies from 'js-cookie';
import {
  ApiResponse,
  AuthResponse,
  LoginCredentials,
  SignupCredentials,
  User,
  Campaign,
  Contact,
  Group,
  Template,
  Analytics,
  CampaignCreateData,
  ContactCreateData,
  PaginatedResponse,
} from '@/types';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: typeof window !== 'undefined' ? '' : 'http://localhost:3000',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = Cookies.get('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          Cookies.remove('token');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async login(credentials: LoginCredentials): Promise<AxiosResponse<AuthResponse>> {
    return this.client.post('/api/auth/login', credentials);
  }

  async signup(credentials: SignupCredentials): Promise<AxiosResponse<AuthResponse>> {
    return this.client.post('/api/auth/signup', credentials);
  }

  async verifyToken(token: string): Promise<AxiosResponse<AuthResponse>> {
    return this.client.get('/api/auth/verify', {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  async logout(): Promise<AxiosResponse<ApiResponse>> {
    return this.client.post('/api/auth/logout');
  }

  // User endpoints
  async getProfile(): Promise<AxiosResponse<ApiResponse<User>>> {
    return this.client.get('/api/auth/profile');
  }

  async updateProfile(data: Partial<User>): Promise<AxiosResponse<ApiResponse<User>>> {
    return this.client.put('/api/auth/profile', data);
  }

  // Campaign endpoints
  async getCampaigns(page = 1, limit = 10): Promise<AxiosResponse<PaginatedResponse<Campaign>>> {
    return this.client.get(`/api/campaigns?page=${page}&limit=${limit}`);
  }

  async getCampaign(id: string): Promise<AxiosResponse<ApiResponse<Campaign>>> {
    return this.client.get(`/api/campaigns/${id}`);
  }

  async createCampaign(data: CampaignCreateData): Promise<AxiosResponse<ApiResponse<Campaign>>> {
    return this.client.post('/api/campaigns', data);
  }

  async updateCampaign(id: string, data: Partial<CampaignCreateData>): Promise<AxiosResponse<ApiResponse<Campaign>>> {
    return this.client.put(`/api/campaigns/${id}`, data);
  }

  async deleteCampaign(id: string): Promise<AxiosResponse<ApiResponse>> {
    return this.client.delete(`/api/campaigns/${id}`);
  }

  async sendCampaign(id: string): Promise<AxiosResponse<ApiResponse>> {
    return this.client.post(`/api/campaigns/${id}/send`);
  }

  // Contact endpoints
  async getContacts(page = 1, limit = 10): Promise<AxiosResponse<PaginatedResponse<Contact>>> {
    return this.client.get(`/api/contacts?page=${page}&limit=${limit}`);
  }

  async getContact(id: string): Promise<AxiosResponse<ApiResponse<Contact>>> {
    return this.client.get(`/api/contacts/${id}`);
  }

  async createContact(data: ContactCreateData): Promise<AxiosResponse<ApiResponse<Contact>>> {
    return this.client.post('/api/contacts', data);
  }

  async updateContact(id: string, data: Partial<ContactCreateData>): Promise<AxiosResponse<ApiResponse<Contact>>> {
    return this.client.put(`/api/contacts/${id}`, data);
  }

  async deleteContact(id: string): Promise<AxiosResponse<ApiResponse>> {
    return this.client.delete(`/api/contacts/${id}`);
  }

  async importContacts(file: File): Promise<AxiosResponse<ApiResponse>> {
    const formData = new FormData();
    formData.append('file', file);
    return this.client.post('/api/contacts/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  // Group endpoints
  async getGroups(): Promise<AxiosResponse<ApiResponse<Group[]>>> {
    return this.client.get('/api/groups');
  }

  async createGroup(data: { name: string; description?: string; contactIds?: string[] }): Promise<AxiosResponse<ApiResponse<Group>>> {
    return this.client.post('/api/groups', data);
  }

  async updateGroup(id: string, data: Partial<Group>): Promise<AxiosResponse<ApiResponse<Group>>> {
    return this.client.put(`/api/groups/${id}`, data);
  }

  async deleteGroup(id: string): Promise<AxiosResponse<ApiResponse>> {
    return this.client.delete(`/api/groups/${id}`);
  }

  // Template endpoints
  async getTemplates(): Promise<AxiosResponse<ApiResponse<Template[]>>> {
    return this.client.get('/api/templates');
  }

  async createTemplate(data: { name: string; content: string }): Promise<AxiosResponse<ApiResponse<Template>>> {
    return this.client.post('/api/templates', data);
  }

  async updateTemplate(id: string, data: Partial<Template>): Promise<AxiosResponse<ApiResponse<Template>>> {
    return this.client.put(`/api/templates/${id}`, data);
  }

  async deleteTemplate(id: string): Promise<AxiosResponse<ApiResponse>> {
    return this.client.delete(`/api/templates/${id}`);
  }

  // Analytics endpoints
  async getAnalytics(): Promise<AxiosResponse<ApiResponse<Analytics>>> {
    return this.client.get('/api/analytics');
  }

  async getCampaignAnalytics(campaignId: string): Promise<AxiosResponse<ApiResponse<any>>> {
    return this.client.get(`/api/analytics/campaigns/${campaignId}`);
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export specific API modules
export const authApi = {
  login: apiClient.login.bind(apiClient),
  signup: apiClient.signup.bind(apiClient),
  verifyToken: apiClient.verifyToken.bind(apiClient),
  logout: apiClient.logout.bind(apiClient),
  getProfile: apiClient.getProfile.bind(apiClient),
  updateProfile: apiClient.updateProfile.bind(apiClient),
};

export const campaignApi = {
  getAll: apiClient.getCampaigns.bind(apiClient),
  getById: apiClient.getCampaign.bind(apiClient),
  create: apiClient.createCampaign.bind(apiClient),
  update: apiClient.updateCampaign.bind(apiClient),
  delete: apiClient.deleteCampaign.bind(apiClient),
  send: apiClient.sendCampaign.bind(apiClient),
};

export const contactApi = {
  getAll: apiClient.getContacts.bind(apiClient),
  getById: apiClient.getContact.bind(apiClient),
  create: apiClient.createContact.bind(apiClient),
  update: apiClient.updateContact.bind(apiClient),
  delete: apiClient.deleteContact.bind(apiClient),
  import: apiClient.importContacts.bind(apiClient),
};

export const groupApi = {
  getAll: apiClient.getGroups.bind(apiClient),
  create: apiClient.createGroup.bind(apiClient),
  update: apiClient.updateGroup.bind(apiClient),
  delete: apiClient.deleteGroup.bind(apiClient),
};

export const templateApi = {
  getAll: apiClient.getTemplates.bind(apiClient),
  create: apiClient.createTemplate.bind(apiClient),
  update: apiClient.updateTemplate.bind(apiClient),
  delete: apiClient.deleteTemplate.bind(apiClient),
};

export const analyticsApi = {
  getOverview: apiClient.getAnalytics.bind(apiClient),
  getCampaignStats: apiClient.getCampaignAnalytics.bind(apiClient),
};
