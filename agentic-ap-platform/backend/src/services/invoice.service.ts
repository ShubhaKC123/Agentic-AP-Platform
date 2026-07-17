import { v4 as uuidv4 } from "uuid";
import {
  Invoice,
  InvoiceDashboardStats,
  InvoiceStatus,
} from "../models/types";
import { readJsonFile, writeJsonFile } from "../utils/storage";
import { paginate, sortBy } from "../utils/helpers";
import { notificationService } from "./notification.service";
import { vendorService } from "./vendor.service";
import { getIO } from "../socket/io";

const FILE = "invoices.json";

const PIPELINE: InvoiceStatus[] = [
  "UPLOADED",
  "PROCESSING",
  "OCR_COMPLETE",
  "PII_MASKED",
  "EXTRACTION_COMPLETE",
  "VALIDATION_COMPLETE",
  "APPROVED",
];

function load(): Invoice[] {
  return readJsonFile<Invoice[]>(FILE, []);
}

function save(data: Invoice[]) {
  writeJsonFile(FILE, data);
}

function emitInvoiceUpdate(invoice: Invoice) {
  try {
    getIO().emit("invoice:updated", invoice);
  } catch {
    /* noop */
  }
}

function notifyForStatus(invoice: Invoice) {
  // Only emit user-facing notification types from the product spec
  const map: Partial<Record<InvoiceStatus, { type: Parameters<typeof notificationService.create>[0]["type"]; title: string; message: string }>> = {
    UPLOADED: {
      type: "INVOICE_UPLOADED",
      title: "Invoice Uploaded",
      message: `Invoice ${invoice.invoiceNumber} uploaded`,
    },
    OCR_COMPLETE: {
      type: "OCR_COMPLETE",
      title: "OCR Complete",
      message: `Invoice ${invoice.invoiceNumber} OCR completed`,
    },
    VALIDATION_COMPLETE: {
      type: "VALIDATION_COMPLETE",
      title: "Validation Complete",
      message: `Invoice ${invoice.invoiceNumber} validation completed`,
    },
    HUMAN_REVIEW: {
      type: "HUMAN_REVIEW",
      title: "Human Review Required",
      message: `Invoice ${invoice.invoiceNumber} requires human review`,
    },
    APPROVED: {
      type: "INVOICE_APPROVED",
      title: "Invoice Approved",
      message: `Invoice ${invoice.invoiceNumber} approved`,
    },
    FAILED: {
      type: "INVOICE_FAILED",
      title: "Invoice Failed",
      message: `Invoice ${invoice.invoiceNumber} failed processing`,
    },
  };

  const n = map[invoice.status];
  if (n) {
    notificationService.create({
      ...n,
      entityId: invoice.id,
      entityType: "invoice",
    });
  }
}

export const invoiceService = {
  list(params: {
    page?: number;
    pageSize?: number;
    search?: string;
    status?: string;
    vendorId?: string;
    currency?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }) {
    let items = load();

    if (params.search) {
      const q = params.search.toLowerCase();
      items = items.filter(
        (inv) =>
          inv.invoiceNumber.toLowerCase().includes(q) ||
          inv.vendorName.toLowerCase().includes(q) ||
          inv.fileName.toLowerCase().includes(q)
      );
    }

    if (params.status) {
      items = items.filter((inv) => inv.status === params.status);
    }

    if (params.vendorId) {
      items = items.filter((inv) => inv.vendorId === params.vendorId);
    }

    if (params.currency) {
      items = items.filter((inv) => inv.currency === params.currency);
    }

    items = sortBy(items, params.sortBy ?? "uploadedAt", params.sortOrder ?? "desc");
    return paginate(items, params.page ?? 1, params.pageSize ?? 10);
  },

  getById(id: string): Invoice | null {
    return load().find((inv) => inv.id === id) ?? null;
  },

  create(input: {
    fileName: string;
    fileType: string;
    vendorId?: string;
    amount?: number;
    currency?: string;
  }): Invoice {
    const items = load();
    const vendors = readJsonFile<import("../models/types").Vendor[]>("vendors.json", []);
    let vendor = input.vendorId
      ? vendors.find((v) => v.id === input.vendorId)
      : undefined;

    if (!vendor) {
      const active = vendors.filter((v) => v.status === "ACTIVE");
      vendor = active[Math.floor(Math.random() * active.length)] ?? vendors[0];
    }

    const nextNum =
      items.reduce((max, inv) => {
        const n = parseInt(inv.invoiceNumber.replace("INV-", ""), 10);
        return Number.isFinite(n) ? Math.max(max, n) : max;
      }, 1000) + 1;

    const now = new Date().toISOString();
    const invoice: Invoice = {
      id: uuidv4(),
      invoiceNumber: `INV-${nextNum}`,
      vendorId: vendor?.id ?? "unknown",
      vendorName: vendor?.name ?? "Unknown Vendor",
      uploadedAt: now,
      status: "UPLOADED",
      confidenceScore: 0,
      amount: input.amount ?? Number((Math.random() * 20000 + 100).toFixed(2)),
      currency: input.currency ?? "USD",
      fileName: input.fileName,
      fileType: input.fileType,
      processingStartedAt: now,
      updatedAt: now,
    };

    items.unshift(invoice);
    save(items);

    if (vendor) {
      vendorService.incrementInvoiceCount(vendor.id);
    }

    notifyForStatus(invoice);
    emitInvoiceUpdate(invoice);

    return invoice;
  },

  update(id: string, input: Partial<Invoice>): Invoice | null {
    const items = load();
    const idx = items.findIndex((inv) => inv.id === id);
    if (idx === -1) return null;
    items[idx] = {
      ...items[idx],
      ...input,
      updatedAt: new Date().toISOString(),
    };
    save(items);
    emitInvoiceUpdate(items[idx]);
    return items[idx];
  },

  delete(id: string): boolean {
    const items = load();
    const next = items.filter((inv) => inv.id !== id);
    if (next.length === items.length) return false;
    save(next);
    try {
      getIO().emit("invoice:deleted", { id });
    } catch {
      /* noop */
    }
    return true;
  },

  retry(id: string): Invoice | null {
    const items = load();
    const idx = items.findIndex((inv) => inv.id === id);
    if (idx === -1) return null;
    items[idx] = {
      ...items[idx],
      status: "UPLOADED",
      confidenceScore: 0,
      failureReason: undefined,
      processingStartedAt: new Date().toISOString(),
      processingCompletedAt: undefined,
      processingTimeMs: undefined,
      updatedAt: new Date().toISOString(),
    };
    save(items);
    notifyForStatus(items[idx]);
    emitInvoiceUpdate(items[idx]);
    return items[idx];
  },

  advanceProcessing(): Invoice[] {
    const items = load();
    const updated: Invoice[] = [];

    for (let i = 0; i < items.length; i++) {
      const inv = items[i];
      const terminal: InvoiceStatus[] = ["APPROVED", "FAILED", "HUMAN_REVIEW"];
      if (terminal.includes(inv.status)) continue;

      const currentIdx = PIPELINE.indexOf(inv.status);
      if (currentIdx === -1 || currentIdx >= PIPELINE.length - 1) continue;

      // Only advance a subset each tick for realism
      if (Math.random() > 0.35) continue;

      let nextStatus: InvoiceStatus = PIPELINE[currentIdx + 1];

      // After validation, randomly divert
      if (inv.status === "VALIDATION_COMPLETE") {
        const r = Math.random();
        if (r < 0.05) nextStatus = "FAILED";
        else if (r < 0.15) nextStatus = "HUMAN_REVIEW";
        else nextStatus = "APPROVED";
      }

      const confidence =
        nextStatus === "UPLOADED" || nextStatus === "PROCESSING"
          ? 0
          : Math.min(0.99, inv.confidenceScore + 0.1 + Math.random() * 0.15);

      const now = new Date().toISOString();
      const started = inv.processingStartedAt
        ? new Date(inv.processingStartedAt).getTime()
        : Date.now();

      const isDone = ["APPROVED", "FAILED", "HUMAN_REVIEW"].includes(nextStatus);

      items[i] = {
        ...inv,
        status: nextStatus,
        confidenceScore: Number(confidence.toFixed(2)),
        updatedAt: now,
        processingCompletedAt: isDone ? now : inv.processingCompletedAt,
        processingTimeMs: isDone ? Date.now() - started : inv.processingTimeMs,
        failureReason:
          nextStatus === "FAILED"
            ? "Automated validation failed — confidence or rule mismatch"
            : undefined,
      };

      updated.push(items[i]);
      notifyForStatus(items[i]);
      emitInvoiceUpdate(items[i]);
    }

    if (updated.length > 0) {
      save(items);
    }

    return updated;
  },

  getDashboard(): InvoiceDashboardStats {
    const invoices = load();
    const processingStatuses: InvoiceStatus[] = [
      "UPLOADED",
      "PROCESSING",
      "OCR_COMPLETE",
      "PII_MASKED",
      "EXTRACTION_COMPLETE",
      "VALIDATION_COMPLETE",
    ];

    const statusCounts = new Map<InvoiceStatus, number>();
    const dayMap = new Map<string, number>();
    const vendorMap = new Map<string, number>();
    const processingByDay = new Map<string, { total: number; count: number }>();

    for (const inv of invoices) {
      statusCounts.set(inv.status, (statusCounts.get(inv.status) ?? 0) + 1);
      const day = inv.uploadedAt.slice(0, 10);
      dayMap.set(day, (dayMap.get(day) ?? 0) + 1);
      vendorMap.set(inv.vendorName, (vendorMap.get(inv.vendorName) ?? 0) + 1);

      if (inv.processingTimeMs) {
        const entry = processingByDay.get(day) ?? { total: 0, count: 0 };
        entry.total += inv.processingTimeMs;
        entry.count += 1;
        processingByDay.set(day, entry);
      }
    }

    const allStatuses: InvoiceStatus[] = [
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

    return {
      totalInvoices: invoices.length,
      processing: invoices.filter((i) => processingStatuses.includes(i.status)).length,
      humanReview: invoices.filter((i) => i.status === "HUMAN_REVIEW").length,
      approved: invoices.filter((i) => i.status === "APPROVED").length,
      failed: invoices.filter((i) => i.status === "FAILED").length,
      statusDistribution: allStatuses.map((status) => ({
        status,
        count: statusCounts.get(status) ?? 0,
      })),
      invoicesPerDay: Array.from(dayMap.entries())
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(-30),
      vendorInvoiceCount: Array.from(vendorMap.entries())
        .map(([vendorName, count]) => ({ vendorName, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10),
      averageProcessingTime: Array.from(processingByDay.entries())
        .map(([date, { total, count }]) => ({
          date,
          avgMs: Math.round(total / count),
        }))
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(-30),
    };
  },

  searchAll(query: string, limit = 8): Invoice[] {
    const q = query.toLowerCase();
    return load()
      .filter(
        (inv) =>
          inv.invoiceNumber.toLowerCase().includes(q) ||
          inv.vendorName.toLowerCase().includes(q)
      )
      .slice(0, limit);
  },
};
