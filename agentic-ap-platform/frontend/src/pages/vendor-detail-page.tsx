import { Link, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/page-header";
import { ErrorState } from "@/components/common/error-state";
import { VendorStatusBadge } from "@/components/common/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { vendorApi } from "@/services/vendor.service";
import { formatDate } from "@/lib/utils";

export function VendorDetailPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["vendor", id],
    queryFn: () => vendorApi.getById(id),
    enabled: !!id,
  });

  const deleteMutation = useMutation({
    mutationFn: () => vendorApi.delete(id),
    onSuccess: () => {
      toast.success("Vendor deleted");
      queryClient.invalidateQueries({ queryKey: ["vendors"] });
      navigate("/vendors");
    },
  });

  if (isLoading) return <Skeleton className="h-80 w-full" />;
  if (isError || !data) return <ErrorState onRetry={() => refetch()} />;

  return (
    <div>
      <PageHeader
        title={data.name}
        description={data.code}
        actions={
          <>
            <Button variant="outline" asChild>
              <Link to="/vendors">
                <ArrowLeft className="h-4 w-4" /> Back
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to={`/vendors/${id}/edit`}>
                <Pencil className="h-4 w-4" /> Edit
              </Link>
            </Button>
            <Button variant="destructive" onClick={() => deleteMutation.mutate()}>
              <Trash2 className="h-4 w-4" /> Delete
            </Button>
          </>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Vendor profile</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Status" value={<VendorStatusBadge status={data.status} />} />
          <Field label="Email" value={data.email} />
          <Field label="Phone" value={data.phone} />
          <Field label="GST Number" value={data.gstNumber} />
          <Field label="PAN Number" value={data.panNumber} />
          <Field label="Country" value={data.country} />
          <Field label="Invoice count" value={String(data.invoiceCount)} />
          <Field label="Created" value={formatDate(data.createdAt)} />
          <Field label="Updated" value={formatDate(data.updatedAt)} />
        </CardContent>
      </Card>
    </div>
  );
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <div className="mt-1 text-sm font-medium">{value}</div>
    </div>
  );
}
