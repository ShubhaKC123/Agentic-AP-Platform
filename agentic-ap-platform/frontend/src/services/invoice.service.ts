import api from "./api";
import type {
  Invoice,
  InvoiceDashboardStats,
  PaginatedResponse,
  UploadInvoiceResponse,
} from "@/types";

export interface InvoiceListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
  vendorId?: string;
  currency?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export const invoiceApi = {
  list: async (params: InvoiceListParams = {}) => {
    const { data } = await api.get<PaginatedResponse<Invoice>>("/invoices", { params });
    return data;
  },

  getById: async (id: string) => {
    const { data } = await api.get<Invoice>(`/invoices/${id}`);
    return data;
  },

  upload: async (
    file: File,
    onProgress?: (pct: number) => void,
    extras?: { vendorId?: string; amount?: number; currency?: string }
  ) => {
    const form = new FormData();
    form.append("file", file);
    if (extras?.vendorId) form.append("vendorId", extras.vendorId);
    if (extras?.amount != null) form.append("amount", String(extras.amount));
    if (extras?.currency) form.append("currency", extras.currency);

    const { data } = await api.post<UploadInvoiceResponse>("/invoices", form, {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress: (e) => {
        if (!e.total || !onProgress) return;
        onProgress(Math.round((e.loaded * 100) / e.total));
      },
    });
    return data;
  },

  update: async (id: string, payload: Partial<Invoice>) => {
    const { data } = await api.put<Invoice>(`/invoices/${id}`, payload);
    return data;
  },

  delete: async (id: string) => {
    const { data } = await api.delete<{ success: boolean }>(`/invoices/${id}`);
    return data;
  },

  retry: async (id: string) => {
    const { data } = await api.post<Invoice>(`/invoices/${id}/retry`);
    return data;
  },

  dashboard: async () => {
    const { data } = await api.get<InvoiceDashboardStats>("/dashboard");
    return data;
  },
};
