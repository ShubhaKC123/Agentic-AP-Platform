import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Download, MoreHorizontal, Plus, Search, Trash2, Eye, Pencil } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/page-header";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { VendorStatusBadge } from "@/components/common/status-badge";
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
import { vendorApi } from "@/services/vendor.service";
import { downloadCsv, formatDate, statusLabel } from "@/lib/utils";

export function VendorsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [sortBy, setSortBy] = useState("createdAt");
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

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["vendors", params],
    queryFn: () => vendorApi.list(params),
  });

  const deleteMutation = useMutation({
    mutationFn: vendorApi.delete,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["vendors"] });
      const previous = queryClient.getQueriesData({ queryKey: ["vendors"] });
      queryClient.setQueriesData({ queryKey: ["vendors"] }, (old: unknown) => {
        if (!old || typeof old !== "object" || !("data" in old)) return old;
        const typed = old as { data: { id: string }[]; total: number };
        return {
          ...typed,
          data: typed.data.filter((v) => v.id !== id),
          total: Math.max(0, typed.total - 1),
        };
      });
      return { previous };
    },
    onError: (_err, _id, ctx) => {
      ctx?.previous.forEach(([key, value]) => queryClient.setQueryData(key, value));
    },
    onSuccess: () => {
      toast.success("Vendor deleted");
      setDeleteId(null);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["vendors"] });
      queryClient.invalidateQueries({ queryKey: ["vendor-dashboard"] });
    },
  });

  const exportCsv = () => {
    if (!data?.data.length) return;
    downloadCsv(
      "vendors.csv",
      data.data.map((v) => ({
        name: v.name,
        code: v.code,
        gstNumber: v.gstNumber,
        panNumber: v.panNumber,
        email: v.email,
        phone: v.phone,
        country: v.country,
        status: v.status,
        invoiceCount: v.invoiceCount,
      }))
    );
    toast.success("CSV exported");
  };

  return (
    <div>
      <PageHeader
        title="Vendors"
        description="Manage vendor master data with search, filters, and CRUD."
        actions={
          <>
            <Button variant="outline" onClick={exportCsv}>
              <Download className="h-4 w-4" /> Export CSV
            </Button>
            <Button asChild>
              <Link to="/vendors/new">
                <Plus className="h-4 w-4" /> Create Vendor
              </Link>
            </Button>
          </>
        }
      />

      <div className="mb-4 flex flex-col gap-3 lg:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search name, code, email, GST, PAN…"
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
          <SelectTrigger className="w-full lg:w-44">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="INACTIVE">Inactive</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
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
          <SelectTrigger className="w-full lg:w-52">
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="createdAt:desc">Newest</SelectItem>
            <SelectItem value="name:asc">Name A → Z</SelectItem>
            <SelectItem value="invoiceCount:desc">Most invoices</SelectItem>
            <SelectItem value="country:asc">Country</SelectItem>
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
          title="No vendors found"
          description="Create a vendor to start associating invoices."
          actionLabel="Create vendor"
          onAction={() => navigate("/vendors/new")}
        />
      ) : (
        <div className="rounded-xl border bg-card shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Country</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Invoices</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.data.map((v) => (
                <TableRow key={v.id}>
                  <TableCell className="font-medium">
                    <Link className="hover:underline" to={`/vendors/${v.id}`}>
                      {v.name}
                    </Link>
                  </TableCell>
                  <TableCell className="font-mono text-xs">{v.code}</TableCell>
                  <TableCell>{v.country}</TableCell>
                  <TableCell>
                    <VendorStatusBadge status={v.status} />
                  </TableCell>
                  <TableCell>{v.invoiceCount}</TableCell>
                  <TableCell className="text-muted-foreground">{formatDate(v.createdAt)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" aria-label="Actions">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => navigate(`/vendors/${v.id}`)}>
                          <Eye className="h-4 w-4" /> View
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate(`/vendors/${v.id}/edit`)}>
                          <Pencil className="h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => setDeleteId(v.id)}
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
              Page {data.page} of {data.totalPages} · {data.total} vendors
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={data.page <= 1} onClick={() => setPage((p) => p - 1)}>
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
            <AlertDialogTitle>Delete vendor?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes the vendor from mock storage.
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
