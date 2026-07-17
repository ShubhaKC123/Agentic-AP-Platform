import { faker } from "@faker-js/faker";
import { v4 as uuidv4 } from "uuid";
import {
  Invoice,
  InvoiceStatus,
  Notification,
  NotificationType,
  Vendor,
  VendorStatus,
} from "../models/types";
import { writeJsonFile } from "../utils/storage";

const STATUSES: InvoiceStatus[] = [
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

const CURRENCIES = ["USD", "EUR", "GBP", "INR", "CAD", "AUD", "SGD"];
const COUNTRIES = [
  "United States",
  "India",
  "United Kingdom",
  "Germany",
  "Canada",
  "Australia",
  "Singapore",
  "France",
  "Japan",
  "Netherlands",
];

const VENDOR_STATUSES: VendorStatus[] = ["ACTIVE", "INACTIVE", "PENDING"];

function randomStatusWeighted(): InvoiceStatus {
  const r = Math.random();
  if (r < 0.35) return "APPROVED";
  if (r < 0.5) return "PROCESSING";
  if (r < 0.6) return "HUMAN_REVIEW";
  if (r < 0.68) return "FAILED";
  if (r < 0.75) return "OCR_COMPLETE";
  if (r < 0.82) return "EXTRACTION_COMPLETE";
  if (r < 0.88) return "VALIDATION_COMPLETE";
  if (r < 0.93) return "PII_MASKED";
  return "UPLOADED";
}

export function generateSeedData() {
  const vendors: Vendor[] = [];
  for (let i = 0; i < 50; i++) {
    const createdAt = faker.date.past({ years: 1 }).toISOString();
    vendors.push({
      id: uuidv4(),
      name: faker.company.name(),
      code: `VND-${String(i + 1).padStart(4, "0")}`,
      gstNumber: `${faker.string.alphanumeric({ length: 2, casing: "upper" })}${faker.string.numeric(10)}${faker.string.alphanumeric({ length: 3, casing: "upper" })}`,
      panNumber: `${faker.string.alpha({ length: 5, casing: "upper" })}${faker.string.numeric(4)}${faker.string.alpha({ length: 1, casing: "upper" })}`,
      email: faker.internet.email().toLowerCase(),
      phone: faker.phone.number({ style: "international" }),
      country: faker.helpers.arrayElement(COUNTRIES),
      status: faker.helpers.weightedArrayElement([
        { weight: 7, value: "ACTIVE" as VendorStatus },
        { weight: 2, value: "INACTIVE" as VendorStatus },
        { weight: 1, value: "PENDING" as VendorStatus },
      ]),
      createdAt,
      updatedAt: createdAt,
      invoiceCount: 0,
    });
  }

  const invoices: Invoice[] = [];
  for (let i = 0; i < 200; i++) {
    const vendor = faker.helpers.arrayElement(vendors);
    const uploadedAt = faker.date.recent({ days: 45 }).toISOString();
    const status = randomStatusWeighted();
    const fileExt = faker.helpers.arrayElement(["pdf", "png", "jpg"]);
    const processingStartedAt = new Date(uploadedAt).toISOString();
    const processingTimeMs =
      status === "APPROVED" || status === "FAILED" || status === "HUMAN_REVIEW"
        ? faker.number.int({ min: 8000, max: 120000 })
        : undefined;

    invoices.push({
      id: uuidv4(),
      invoiceNumber: `INV-${1000 + i}`,
      vendorId: vendor.id,
      vendorName: vendor.name,
      uploadedAt,
      status,
      confidenceScore:
        status === "UPLOADED" || status === "PROCESSING"
          ? 0
          : Number(faker.number.float({ min: 0.55, max: 0.99, fractionDigits: 2 })),
      amount: Number(faker.number.float({ min: 50, max: 50000, fractionDigits: 2 })),
      currency: faker.helpers.arrayElement(CURRENCIES),
      fileName: `invoice-${1000 + i}.${fileExt}`,
      fileType: fileExt === "pdf" ? "application/pdf" : `image/${fileExt === "jpg" ? "jpeg" : fileExt}`,
      processingStartedAt,
      processingCompletedAt: processingTimeMs
        ? new Date(new Date(uploadedAt).getTime() + processingTimeMs).toISOString()
        : undefined,
      processingTimeMs,
      failureReason: status === "FAILED" ? faker.helpers.arrayElement([
        "OCR confidence below threshold",
        "Vendor mismatch detected",
        "Duplicate invoice number",
        "Invalid GST number",
        "Amount extraction failed",
      ]) : undefined,
      updatedAt: uploadedAt,
    });

    vendor.invoiceCount += 1;
  }

  const notifications: Notification[] = [];
  const notifTypes: { type: NotificationType; title: string; message: (inv: Invoice) => string }[] = [
    { type: "INVOICE_UPLOADED", title: "Invoice Uploaded", message: (inv) => `Invoice ${inv.invoiceNumber} uploaded` },
    { type: "OCR_COMPLETE", title: "OCR Complete", message: (inv) => `Invoice ${inv.invoiceNumber} OCR completed` },
    { type: "VALIDATION_COMPLETE", title: "Validation Complete", message: (inv) => `Invoice ${inv.invoiceNumber} validation completed` },
    { type: "HUMAN_REVIEW", title: "Human Review Required", message: (inv) => `Invoice ${inv.invoiceNumber} requires human review` },
    { type: "INVOICE_APPROVED", title: "Invoice Approved", message: (inv) => `Invoice ${inv.invoiceNumber} approved` },
    { type: "INVOICE_FAILED", title: "Invoice Failed", message: (inv) => `Invoice ${inv.invoiceNumber} failed processing` },
  ];

  for (let i = 0; i < 90; i++) {
    const inv = faker.helpers.arrayElement(invoices);
    const tpl = faker.helpers.arrayElement(notifTypes);
    notifications.push({
      id: uuidv4(),
      type: tpl.type,
      title: tpl.title,
      message: tpl.message(inv),
      entityId: inv.id,
      entityType: "invoice",
      read: faker.datatype.boolean({ probability: 0.4 }),
      createdAt: faker.date.recent({ days: 30 }).toISOString(),
    });
  }

  for (let i = 0; i < 10; i++) {
    const vendor = faker.helpers.arrayElement(vendors);
    notifications.push({
      id: uuidv4(),
      type: "VENDOR_CREATED",
      title: "Vendor Created",
      message: `Vendor ${vendor.name} created`,
      entityId: vendor.id,
      entityType: "vendor",
      read: faker.datatype.boolean({ probability: 0.5 }),
      createdAt: faker.date.recent({ days: 30 }).toISOString(),
    });
  }

  notifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  writeJsonFile("vendors.json", vendors);
  writeJsonFile("invoices.json", invoices);
  writeJsonFile("notifications.json", notifications);

  console.log(`Seeded ${vendors.length} vendors, ${invoices.length} invoices, ${notifications.length} notifications`);
  return { vendors, invoices, notifications };
}

if (require.main === module) {
  generateSeedData();
}
