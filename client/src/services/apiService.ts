import { Claim, ClaimFormData } from "@typings";
import axios, { AxiosInstance } from "axios";
class ApiService {
  private api: AxiosInstance;
  constructor() {
    this.api = axios.create({
      baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080",
      timeout: 30000
    });
    this.api.interceptors.request.use(config => {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
    this.api.interceptors.response.use(response => response, error => {
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/login";
      }
      return Promise.reject(error);
    });
  }
  async updateClaim(id: string, data: Partial<ClaimFormData>, files: File[]) {
    const fd = new FormData();
    if (data.name) fd.append("name", data.name);
    if (data.policyId) fd.append("policyId", data.policyId);
    if (data.description) fd.append("description", data.description);
    files.slice(0, 10).forEach(f => fd.append("files", f, f.name));
    const res = await fetch(`/api/claims/${id}`, {
      method: "PUT",
      body: fd
    });
    if (!res.ok) throw new Error("Failed to update");
    return res.json();
  }
  async submitClaim(data: ClaimFormData, files: File[]) {
    const fd = new FormData();
    fd.append("name", data.name);
    fd.append("policyId", data.policyId);
    fd.append("description", data.description);
    files.slice(0, 10).forEach(f => fd.append("files", f, f.name));
    const res = await fetch("/api/claims", {
      method: "POST",
      body: fd
    });
    if (!res.ok) throw new Error("Failed to submit");
    return res.json();
  }
  async getClaims(): Promise<Claim[]> {
    const response = await this.api.get("/api/claims");
    return response.data;
  }
  async getClaim(id: string): Promise<Claim> {
    const response = await this.api.get(`/api/claims/${id}`);
    return response.data;
  }
  async deleteClaim(id: string): Promise<void> {
    await this.api.delete(`/api/claims/${id}`);
  }
  async policyExists(policyNumber: string): Promise<boolean> {
    if (!policyNumber) return false;
    try {
      const res = await this.api.get("/api/policies/exists", {
        params: {
          policyNumber
        }
      });
      return Boolean(res.data?.exists);
    } catch {
      return false;
    }
  }
}
export default new ApiService();