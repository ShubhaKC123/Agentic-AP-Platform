import { v4 as uuidv4 } from "uuid";
import { Vendor, VendorDashboardStats, VendorStatus } from "../models/types";
import { readJsonFile, writeJsonFile } from "../utils/storage";
import { paginate, sortBy } from "../utils/helpers";
import { notificationService } from "./notification.service";

const FILE = "vendors.json";

function load(): Vendor[] {
  return readJsonFile<Vendor[]>(FILE, []);
}

function save(data: Vendor[]) {
  writeJsonFile(FILE, data);
}

export const vendorService = {
  list(params: {
    page?: number;
    pageSize?: number;
    search?: string;
    status?: string;
    country?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }) {
    let items = load();

    if (params.search) {
      const q = params.search.toLowerCase();
      items = items.filter(
        (v) =>
          v.name.toLowerCase().includes(q) ||
          v.code.toLowerCase().includes(q) ||
          v.email.toLowerCase().includes(q) ||
          v.gstNumber.toLowerCase().includes(q) ||
          v.panNumber.toLowerCase().includes(q)
      );
    }

    if (params.status) {
      items = items.filter((v) => v.status === params.status);
    }

    if (params.country) {
      items = items.filter((v) => v.country === params.country);
    }

    items = sortBy(items, params.sortBy ?? "createdAt", params.sortOrder ?? "desc");
    return paginate(items, params.page ?? 1, params.pageSize ?? 10);
  },

  getById(id: string): Vendor | null {
    return load().find((v) => v.id === id) ?? null;
  },

  create(input: {
    name: string;
    code: string;
    gstNumber: string;
    panNumber: string;
    email: string;
    phone: string;
    country: string;
    status?: VendorStatus;
  }): Vendor {
    const items = load();
    if (items.some((v) => v.code === input.code)) {
      throw new Error("Vendor code already exists");
    }
    const now = new Date().toISOString();
    const vendor: Vendor = {
      id: uuidv4(),
      name: input.name,
      code: input.code,
      gstNumber: input.gstNumber,
      panNumber: input.panNumber,
      email: input.email,
      phone: input.phone,
      country: input.country,
      status: input.status ?? "PENDING",
      createdAt: now,
      updatedAt: now,
      invoiceCount: 0,
    };
    items.unshift(vendor);
    save(items);

    notificationService.create({
      type: "VENDOR_CREATED",
      title: "Vendor Created",
      message: `Vendor ${vendor.name} created`,
      entityId: vendor.id,
      entityType: "vendor",
    });

    return vendor;
  },

  update(
    id: string,
    input: Partial<{
      name: string;
      code: string;
      gstNumber: string;
      panNumber: string;
      email: string;
      phone: string;
      country: string;
      status: VendorStatus;
    }>
  ): Vendor | null {
    const items = load();
    const idx = items.findIndex((v) => v.id === id);
    if (idx === -1) return null;

    if (input.code && items.some((v) => v.code === input.code && v.id !== id)) {
      throw new Error("Vendor code already exists");
    }

    items[idx] = {
      ...items[idx],
      ...input,
      updatedAt: new Date().toISOString(),
    };
    save(items);
    return items[idx];
  },

  delete(id: string): boolean {
    const items = load();
    const next = items.filter((v) => v.id !== id);
    if (next.length === items.length) return false;
    save(next);
    return true;
  },

  incrementInvoiceCount(vendorId: string) {
    const items = load();
    const idx = items.findIndex((v) => v.id === vendorId);
    if (idx === -1) return;
    items[idx].invoiceCount += 1;
    items[idx].updatedAt = new Date().toISOString();
    save(items);
  },

  getDashboard(): VendorDashboardStats {
    const vendors = load();
    const countryMap = new Map<string, number>();
    const monthMap = new Map<string, number>();

    for (const v of vendors) {
      countryMap.set(v.country, (countryMap.get(v.country) ?? 0) + 1);
      const month = v.createdAt.slice(0, 7);
      monthMap.set(month, (monthMap.get(month) ?? 0) + 1);
    }

    const monthlyCreation = Array.from(monthMap.entries())
      .map(([month, count]) => ({ month, count }))
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-12);

    const topVendors = [...vendors]
      .sort((a, b) => b.invoiceCount - a.invoiceCount)
      .slice(0, 10)
      .map((v) => ({ vendorName: v.name, invoiceCount: v.invoiceCount }));

    return {
      totalVendors: vendors.length,
      active: vendors.filter((v) => v.status === "ACTIVE").length,
      inactive: vendors.filter((v) => v.status === "INACTIVE").length,
      pending: vendors.filter((v) => v.status === "PENDING").length,
      countryDistribution: Array.from(countryMap.entries())
        .map(([country, count]) => ({ country, count }))
        .sort((a, b) => b.count - a.count),
      monthlyCreation,
      topVendors,
    };
  },

  searchAll(query: string, limit = 8): Vendor[] {
    const q = query.toLowerCase();
    return load()
      .filter(
        (v) =>
          v.name.toLowerCase().includes(q) ||
          v.code.toLowerCase().includes(q) ||
          v.email.toLowerCase().includes(q)
      )
      .slice(0, limit);
  },
};
