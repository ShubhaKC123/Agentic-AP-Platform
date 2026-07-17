import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Download,
  Eye,
  MoreHorizontal,
  RefreshCw,
  Search,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/page-header";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { InvoiceStatusBadge } from "@/components/common/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { invoiceApi } from "@/services/invoice.service";
import { INVOICE_STATUSES } from "@/lib/status";
import { downloadCsv, formatCurrency, formatDate, formatPercent, statusLabel } from "@/lib/utils";

export function InvoicesPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [sortBy, setSortBy] = useState("uploadedAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const params = useMemo(
    () => ({
      page,
      pageSize: 10,
      search: search || undefined,
      status: status === "all" ? undefined : status,
      sortBy,
      sortOrder,
    }),
    [page, search, status, sortBy, sortOrder]
  );

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["invoices", params],
    queryFn: () => invoiceApi.list(params),
  });

  const deleteMutation = useMutation({
    mutationFn: invoiceApi.delete,
    onSuccess: () => {
      toast.success("Invoice deleted");
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      setDeleteId(null);
    },
  });

  const retryMutation = useMutation({
    mutationFn: invoiceApi.retry,
    onSuccess: (inv) => {
      toast.success(`Retry started for ${inv.invoiceNumber}`);
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
  });

  const exportCsv = () => {
    if (!data?.data.length) return;
    downloadCsv(
      "invoices.csv",
      data.data.map((inv) => ({
        invoiceNumber: inv.invoiceNumber,
        vendor: inv.vendorName,
        uploadedAt: inv.uploadedAt,
        status: inv.status,
        confidence: inv.confidenceScore,
        amount: inv.amount,
        currency: inv.currency,
      }))
    );
    toast.success("CSV exported");
  };

  return (
    <div>
      <PageHeader
        title="Invoices"
        description="Track OCR, extraction, validation, and approval in real time."
        actions={
          <>
            <Button variant="outline" onClick={exportCsv}>
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
            <Button variant="outline" onClick={() => refetch()} disabled={isFetching}>
              <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button asChild>
              <Link to="/invoices/upload">Upload</Link>
            </Button>
          </>
        }
      />

      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search invoice number or vendor…"
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
          />
        </div>
        <Select
          value={status}
          onValueChange={(v) => {
            setPage(1);
            setStatus(v);
          }}
        >
          <SelectTrigger className="w-full lg:w-52">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {INVOICE_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {statusLabel(s)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={`${sortBy}:${sortOrder}`}
          onValueChange={(v) => {
            const [field, order] = v.split(":") as [string, "asc" | "desc"];
            setSortBy(field);
            setSortOrder(order);
          }}
        >
          <SelectTrigger className="w-full lg:w-56">
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="uploadedAt:desc">Newest uploaded</SelectItem>
            <SelectItem value="uploadedAt:asc">Oldest uploaded</SelectItem>
            <SelectItem value="amount:desc">Amount high → low</SelectItem>
            <SelectItem value="amount:asc">Amount low → high</SelectItem>
            <SelectItem value="confidenceScore:desc">Confidence high → low</SelectItem>
            <SelectItem value="invoiceNumber:asc">Invoice number A → Z</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : !data?.data.length ? (
        <EmptyState
          title="No invoices found"
          description="Upload an invoice or adjust your filters."
          actionLabel="Upload invoice"
          onAction={() => navigate("/invoices/upload")}
        />
      ) : (
        <div className="rounded-xl border bg-card shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice Number</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead>Uploaded At</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Confidence</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Currency</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.data.map((inv) => (
                <TableRow key={inv.id}>
                  <TableCell className="font-medium">
                    <Link className="hover:underline" to={`/invoices/${inv.id}`}>
                      {inv.invoiceNumber}
                    </Link>
                  </TableCell>
                  <TableCell>{inv.vendorName}</TableCell>
                  <TableCell className="whitespace-nowrap text-muted-foreground">
                    {formatDate(inv.uploadedAt)}
                  </TableCell>
                  <TableCell>
                    <InvoiceStatusBadge status={inv.status} />
                  </TableCell>
                  <TableCell>{formatPercent(inv.confidenceScore)}</TableCell>
                  <TableCell>{formatCurrency(inv.amount, inv.currency)}</TableCell>
                  <TableCell>{inv.currency}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" aria-label="Actions">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => navigate(`/invoices/${inv.id}`)}>
                          <Eye className="h-4 w-4" /> View
                        </DropdownMenuItem>
                        {(inv.status === "FAILED" || inv.status === "HUMAN_REVIEW") && (
                          <DropdownMenuItem onClick={() => retryMutation.mutate(inv.id)}>
                            <RefreshCw className="h-4 w-4" /> Retry
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => setDeleteId(inv.id)}
                        >
                          <Trash2 className="h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="flex items-center justify-between border-t px-4 py-3 text-sm">
            <p className="text-muted-foreground">
              Page {data.page} of {data.totalPages} · {data.total} invoices
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={data.page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={data.page >= data.totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      )}

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete invoice?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes the invoice from the mock store. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
