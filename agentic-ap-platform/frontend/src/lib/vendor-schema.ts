import { z } from "zod";

export const vendorSchema = z.object({
  name: z.string().min(2, "Vendor name is required"),
  code: z
    .string()
    .min(2, "Vendor code is required")
    .regex(/^[A-Z0-9-]+$/i, "Use letters, numbers, and hyphens only"),
  gstNumber: z.string().min(8, "GST number is required"),
  panNumber: z
    .string()
    .min(10, "PAN must be 10 characters")
    .max(10, "PAN must be 10 characters"),
  email: z.string().email("Enter a valid email"),
  phone: z.string().min(7, "Phone number is required"),
  country: z.string().min(2, "Country is required"),
  status: z.enum(["ACTIVE", "INACTIVE", "PENDING"]),
});

export type VendorFormValues = z.infer<typeof vendorSchema>;
