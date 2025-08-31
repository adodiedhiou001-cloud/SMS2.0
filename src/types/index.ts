export interface User {
  id: string;
  username: string;
  email?: string | null;
  organizationId: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Organization {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrganizationSettings {
  allowUserRegistration: boolean;
  defaultUserRole: 'user' | 'manager';
  smsLimit: number;
  features: string[];
}

export interface Campaign {
  id: string;
  name: string;
  message: string;
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed';
  scheduledAt?: string;
  sentAt?: string;
  recipientCount: number;
  sentCount: number;
  failedCount: number;
  organizationId: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Contact {
  id: string;
  phoneNumber: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  tags: string[];
  groups: string[];
  organizationId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Group {
  id: string;
  name: string;
  description?: string;
  contactIds: string[];
  organizationId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Template {
  id: string;
  name: string;
  content: string;
  variables: string[];
  organizationId: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  campaignId: string;
  contactId: string;
  phoneNumber: string;
  content: string;
  status: 'pending' | 'sent' | 'delivered' | 'failed';
  sentAt?: string;
  deliveredAt?: string;
  error?: string;
  organizationId: string;
  createdAt: string;
}

export interface ApiKey {
  id: string;
  name: string;
  key: string;
  permissions: string[];
  organizationId: string;
  createdBy: string;
  lastUsed?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Analytics {
  totalCampaigns: number;
  totalContacts: number;
  totalMessagesSent: number;
  deliveryRate: number;
  campaignsThisMonth: number;
  messagesThisMonth: number;
  recentActivity: ActivityItem[];
}

export interface ActivityItem {
  id: string;
  type: 'campaign_created' | 'campaign_sent' | 'contact_added' | 'message_sent';
  description: string;
  timestamp: string;
  userId: string;
  organizationId: string;
}

export interface AuthResponse {
  token: string;
  user: User;
  organization?: Organization;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T = any> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface SignupCredentials extends LoginCredentials {
  email?: string;
  organizationName?: string;
}

export interface CampaignCreateData {
  name: string;
  message: string;
  recipientIds: string[];
  groupIds?: string[];
  scheduledAt?: string;
}

export interface ContactCreateData {
  phoneNumber: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  tags?: string[];
  groupIds?: string[];
}

export interface FormState {
  isSubmitting: boolean;
  error: string | null;
  success: string | null;
}
