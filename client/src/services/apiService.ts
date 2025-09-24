import { Claim } from "@/types/Claim.type.js";
import axios, { AxiosInstance } from "axios";

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
      timeout: 30000,
    });

    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem("token");
          window.location.href = "/login";
        }
        return Promise.reject(error);
      }
    );
  }

  async submitClaim(formData: FormData): Promise<Claim> {
    const response = await this.api.post("/api/claims", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  }

  async getClaims(): Promise<Claim[]> {
    const response = await this.api.get("/api/claims");
    return response.data;
  }

  async getClaim(id: string): Promise<Claim> {
    const response = await this.api.get(`/api/claims/${id}`);
    return response.data;
  }

  async updateClaim(id: string, data: Partial<Claim>): Promise<Claim> {
    const response = await this.api.put(`/api/claims/${id}`, data);
    return response.data;
  }

  async deleteClaim(id: string): Promise<void> {
    await this.api.delete(`/api/claims/${id}`);
  }

  // ================
  // Policy
  // ============
  async policyExists(policyNumber: string): Promise<boolean> {
    if (!policyNumber) return false;
    try {
      const res = await this.api.get("/api/policies/exists", {
        params: { policyNumber },
      });
      return Boolean(res.data?.exists);
    } catch {
      return false;
    }
  }
}

export default new ApiService();
