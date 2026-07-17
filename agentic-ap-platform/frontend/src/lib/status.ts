import type { InvoiceStatus, VendorStatus } from "@/types";

export const INVOICE_STATUSES: InvoiceStatus[] = [
  "UPLOADED",
  "PROCESSING",
  "OCR_COMPLETE",
  "PII_MASKED",
  "EXTRACTION_COMPLETE",
  "VALIDATION_COMPLETE",
  "HUMAN_REVIEW",
  "APPROVED",
  "FAILED",
];

export function invoiceStatusClass(status: InvoiceStatus): string {
  const map: Record<InvoiceStatus, string> = {
    UPLOADED: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200",
    PROCESSING: "bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-200",
    OCR_COMPLETE: "bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-200",
    PII_MASKED: "bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-200",
    EXTRACTION_COMPLETE: "bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-200",
    VALIDATION_COMPLETE: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200",
    HUMAN_REVIEW: "bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-200",
    APPROVED: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200",
    FAILED: "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200",
  };
  return map[status];
}

export function vendorStatusClass(status: VendorStatus): string {
  const map: Record<VendorStatus, string> = {
    ACTIVE: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200",
    INACTIVE: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200",
    PENDING: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200",
  };
  return map[status];
}
