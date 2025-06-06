import { auth } from '@/lib/firebase';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://us-central1-randevuai-b0249.cloudfunctions.net/api';

export interface ApiResponse {
  success: boolean;
  data?: any;
  error?: string;
}

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async getAuthHeaders(): Promise<Record<string, string>> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    try {
      const currentUser = auth.currentUser;
      if (currentUser) {
        const token = await currentUser.getIdToken();
        headers['Authorization'] = `Bearer ${token}`;
      }
    } catch (error) {
      console.warn('Failed to get auth token:', error);
    }

    return headers;
  }

  async makeRequest(endpoint: string, options: RequestInit = {}): Promise<Response> {
    const url = `${this.baseURL}${endpoint}`;
    const headers = await this.getAuthHeaders();

    const config: RequestInit = {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    };

    console.log(`Making API request: ${config.method || 'GET'} ${url}`);

    try {
      const response = await fetch(url, config);
      console.log(`API response: ${response.status} ${response.statusText}`);
      return response;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  async handleResponse(response: Response): Promise<ApiResponse> {
    try {
      const text = await response.text();

      if (!text) {
        return {
          success: false,
          error: 'Empty response from server'
        };
      }

      const data = JSON.parse(text);

      if (!response.ok) {
        return {
          success: false,
          error: data.error || `HTTP ${response.status}: ${response.statusText}`
        };
      }

      return data;
    } catch (error) {
      console.error('Response parsing failed:', error);
      return {
        success: false,
        error: 'Failed to parse server response'
      };
    }
  }

  async get(endpoint: string): Promise<ApiResponse> {
    const response = await this.makeRequest(endpoint, {
      method: 'GET',
    });
    return this.handleResponse(response);
  }

  async post(endpoint: string, data?: any): Promise<ApiResponse> {
    const response = await this.makeRequest(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
    return this.handleResponse(response);
  }

  async put(endpoint: string, data?: any): Promise<ApiResponse> {
    const response = await this.makeRequest(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
    return this.handleResponse(response);
  }

  async delete(endpoint: string): Promise<ApiResponse> {
    const response = await this.makeRequest(endpoint, {
      method: 'DELETE',
    });
    return this.handleResponse(response);
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
