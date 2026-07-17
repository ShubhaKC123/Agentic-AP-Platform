import { Link, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, RefreshCw, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/page-header";
import { ErrorState } from "@/components/common/error-state";
import { InvoiceStatusBadge } from "@/components/common/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { invoiceApi } from "@/services/invoice.service";
import { formatCurrency, formatDate, formatPercent } from "@/lib/utils";

export function InvoiceDetailPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["invoice", id],
    queryFn: () => invoiceApi.getById(id),
    enabled: !!id,
  });

  const deleteMutation = useMutation({
    mutationFn: () => invoiceApi.delete(id),
    onSuccess: () => {
      toast.success("Invoice deleted");
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      navigate("/invoices");
    },
  });

  const retryMutation = useMutation({
    mutationFn: () => invoiceApi.retry(id),
    onSuccess: () => {
      toast.success("Retry started");
      queryClient.invalidateQueries({ queryKey: ["invoice", id] });
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (isError || !data) {
    return <ErrorState title="Invoice not found" onRetry={() => refetch()} />;
  }

  return (
    <div>
      <PageHeader
        title={data.invoiceNumber}
        description={data.fileName}
        actions={
          <>
            <Button variant="outline" asChild>
              <Link to="/invoices">
                <ArrowLeft className="h-4 w-4" /> Back
              </Link>
            </Button>
            {(data.status === "FAILED" || data.status === "HUMAN_REVIEW") && (
              <Button variant="outline" onClick={() => retryMutation.mutate()}>
                <RefreshCw className="h-4 w-4" /> Retry
              </Button>
            )}
            <Button variant="destructive" onClick={() => deleteMutation.mutate()}>
              <Trash2 className="h-4 w-4" /> Delete
            </Button>
          </>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Invoice details</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <Field label="Vendor" value={data.vendorName} />
            <Field label="Status" value={<InvoiceStatusBadge status={data.status} />} />
            <Field label="Amount" value={formatCurrency(data.amount, data.currency)} />
            <Field label="Currency" value={data.currency} />
            <Field label="Confidence" value={formatPercent(data.confidenceScore)} />
            <Field label="Uploaded" value={formatDate(data.uploadedAt)} />
            <Field label="Updated" value={formatDate(data.updatedAt)} />
            <Field label="File type" value={data.fileType} />
            {data.processingTimeMs != null ? (
              <Field
                label="Processing time"
                value={`${Math.round(data.processingTimeMs / 1000)}s`}
              />
            ) : null}
            {data.failureReason ? (
              <Field label="Failure reason" value={data.failureReason} />
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Pipeline</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-3 text-sm">
              {[
                "UPLOADED",
                "PROCESSING",
                "OCR_COMPLETE",
                "PII_MASKED",
                "EXTRACTION_COMPLETE",
                "VALIDATION_COMPLETE",
                "APPROVED",
              ].map((step) => {
                const active = data.status === step;
                const failed = data.status === "FAILED";
                const review = data.status === "HUMAN_REVIEW";
                return (
                  <li
                    key={step}
                    className={`rounded-lg border px-3 py-2 ${
                      active || (step === "APPROVED" && (failed || review))
                        ? "border-primary/40 bg-primary/5"
                        : ""
                    }`}
                  >
                    {step.replace(/_/g, " ")}
                  </li>
                );
              })}
              {(data.status === "HUMAN_REVIEW" || data.status === "FAILED") && (
                <li className="rounded-lg border border-orange-300 bg-orange-50 px-3 py-2 dark:bg-orange-950/30">
                  {data.status.replace(/_/g, " ")}
                </li>
              )}
            </ol>
          </CardContent>
        </Card>
      </div>
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
