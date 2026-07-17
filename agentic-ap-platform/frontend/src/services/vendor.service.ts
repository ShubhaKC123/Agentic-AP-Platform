import api from "./api";
import type { PaginatedResponse, Vendor, VendorDashboardStats, VendorStatus } from "@/types";

export interface VendorListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
  country?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface VendorPayload {
  name: string;
  code: string;
  gstNumber: string;
  panNumber: string;
  email: string;
  phone: string;
  country: string;
  status?: VendorStatus;
}

export const vendorApi = {
  list: async (params: VendorListParams = {}) => {
    const { data } = await api.get<PaginatedResponse<Vendor>>("/vendors", { params });
    return data;
  },

  getById: async (id: string) => {
    const { data } = await api.get<Vendor>(`/vendors/${id}`);
    return data;
  },

  create: async (payload: VendorPayload) => {
    const { data } = await api.post<Vendor>("/vendors", payload);
    return data;
  },

  update: async (id: string, payload: Partial<VendorPayload>) => {
    const { data } = await api.put<Vendor>(`/vendors/${id}`, payload);
    return data;
  },

  delete: async (id: string) => {
    const { data } = await api.delete<{ success: boolean }>(`/vendors/${id}`);
    return data;
  },

  dashboard: async () => {
    const { data } = await api.get<VendorDashboardStats>("/vendor-dashboard");
    return data;
  },
};
