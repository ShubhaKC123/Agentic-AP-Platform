import { Badge } from "@/components/ui/badge";
import { invoiceStatusClass, vendorStatusClass } from "@/lib/status";
import { statusLabel, cn } from "@/lib/utils";
import type { InvoiceStatus, VendorStatus } from "@/types";

export function InvoiceStatusBadge({ status }: { status: InvoiceStatus }) {
  return (
    <Badge variant="outline" className={cn("border-0 font-medium", invoiceStatusClass(status))}>
      {statusLabel(status)}
    </Badge>
  );
}

export function VendorStatusBadge({ status }: { status: VendorStatus }) {
  return (
    <Badge variant="outline" className={cn("border-0 font-medium", vendorStatusClass(status))}>
      {statusLabel(status)}
    </Badge>
  );
}
