export type InvoiceStatus =
  | "UPLOADED"
  | "PROCESSING"
  | "OCR_COMPLETE"
  | "PII_MASKED"
  | "EXTRACTION_COMPLETE"
  | "VALIDATION_COMPLETE"
  | "HUMAN_REVIEW"
  | "APPROVED"
  | "FAILED";

export type VendorStatus = "ACTIVE" | "INACTIVE" | "PENDING";

export type NotificationType =
  | "INVOICE_UPLOADED"
  | "OCR_COMPLETE"
  | "VALIDATION_COMPLETE"
  | "HUMAN_REVIEW"
  | "VENDOR_CREATED"
  | "INVOICE_APPROVED"
  | "INVOICE_FAILED"
  | "PII_MASKED"
  | "EXTRACTION_COMPLETE"
  | "PROCESSING";

export interface Vendor {
  id: string;
  name: string;
  code: string;
  gstNumber: string;
  panNumber: string;
  email: string;
  phone: string;
  country: string;
  status: VendorStatus;
  createdAt: string;
  updatedAt: string;
  invoiceCount: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  vendorId: string;
  vendorName: string;
  uploadedAt: string;
  status: InvoiceStatus;
  confidenceScore: number;
  amount: number;
  currency: string;
  fileName: string;
  fileType: string;
  processingStartedAt?: string;
  processingCompletedAt?: string;
  processingTimeMs?: number;
  failureReason?: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  entityId?: string;
  entityType?: "invoice" | "vendor";
  read: boolean;
  createdAt: string;
}

export interface InvoiceDashboardStats {
  totalInvoices: number;
  processing: number;
  humanReview: number;
  approved: number;
  failed: number;
  statusDistribution: { status: InvoiceStatus; count: number }[];
  invoicesPerDay: { date: string; count: number }[];
  vendorInvoiceCount: { vendorName: string; count: number }[];
  averageProcessingTime: { date: string; avgMs: number }[];
}

export interface VendorDashboardStats {
  totalVendors: number;
  active: number;
  inactive: number;
  pending: number;
  countryDistribution: { country: string; count: number }[];
  monthlyCreation: { month: string; count: number }[];
  topVendors: { vendorName: string; invoiceCount: number }[];
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
