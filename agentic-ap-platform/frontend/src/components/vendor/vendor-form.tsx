import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { vendorSchema, type VendorFormValues } from "@/lib/vendor-schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

interface VendorFormProps {
  defaultValues?: Partial<VendorFormValues>;
  submitting?: boolean;
  submitLabel?: string;
  onSubmit: (values: VendorFormValues) => void;
}

export function VendorForm({
  defaultValues,
  submitting,
  submitLabel = "Save vendor",
  onSubmit,
}: VendorFormProps) {
  const form = useForm<VendorFormValues>({
    resolver: zodResolver(vendorSchema),
    defaultValues: {
      name: "",
      code: "",
      gstNumber: "",
      panNumber: "",
      email: "",
      phone: "",
      country: "United States",
      status: "PENDING",
      ...defaultValues,
    },
  });

  return (
    <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)} noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Vendor Name" error={form.formState.errors.name?.message}>
          <Input {...form.register("name")} aria-invalid={!!form.formState.errors.name} />
        </Field>
        <Field label="Vendor Code" error={form.formState.errors.code?.message}>
          <Input {...form.register("code")} aria-invalid={!!form.formState.errors.code} />
        </Field>
        <Field label="GST Number" error={form.formState.errors.gstNumber?.message}>
          <Input {...form.register("gstNumber")} />
        </Field>
        <Field label="PAN Number" error={form.formState.errors.panNumber?.message}>
          <Input {...form.register("panNumber")} />
        </Field>
        <Field label="Email" error={form.formState.errors.email?.message}>
          <Input type="email" {...form.register("email")} />
        </Field>
        <Field label="Phone" error={form.formState.errors.phone?.message}>
          <Input {...form.register("phone")} />
        </Field>
        <Field label="Country" error={form.formState.errors.country?.message}>
          <Select
            value={form.watch("country")}
            onValueChange={(v) => form.setValue("country", v, { shouldValidate: true })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {COUNTRIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Status" error={form.formState.errors.status?.message}>
          <Select
            value={form.watch("status")}
            onValueChange={(v) =>
              form.setValue("status", v as VendorFormValues["status"], { shouldValidate: true })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="INACTIVE">Inactive</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
            </SelectContent>
          </Select>
        </Field>
      </div>
      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={submitting}>
          {submitting ? "Saving…" : submitLabel}
        </Button>
      </div>
    </form>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
