import { useQuery } from "@tanstack/react-query";
import {
  CheckCircle2,
  FileText,
  Loader2,
  RefreshCw,
  AlertTriangle,
  UserCheck,
} from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { StatCard } from "@/components/common/stat-card";
import { ErrorState } from "@/components/common/error-state";
import { ChartCard } from "@/components/charts/chart-card";
import { StatusPieChart } from "@/components/charts/status-pie-chart";
import {
  InvoicesPerDayChart,
  ProcessingTimeChart,
  VendorInvoiceBarChart,
} from "@/components/charts/bar-line-charts";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { invoiceApi } from "@/services/invoice.service";

export function DashboardPage() {
  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["dashboard"],
    queryFn: invoiceApi.dashboard,
  });

  return (
    <div>
      <PageHeader
        title="Invoice Dashboard"
        description="Live overview of AI-powered accounts payable processing."
        actions={
          <Button variant="outline" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
            Refresh Dashboard
          </Button>
        }
      />

      {isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            {isLoading || !data ? (
              Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-28 rounded-xl" />
              ))
            ) : (
              <>
                <StatCard title="Total Invoices" value={data.totalInvoices} icon={FileText} index={0} />
                <StatCard title="Processing" value={data.processing} icon={Loader2} index={1} />
                <StatCard title="Human Review" value={data.humanReview} icon={UserCheck} index={2} />
                <StatCard title="Approved" value={data.approved} icon={CheckCircle2} index={3} />
                <StatCard title="Failed" value={data.failed} icon={AlertTriangle} index={4} />
              </>
            )}
          </div>

          <div className="mt-6 grid gap-4 xl:grid-cols-2">
            <ChartCard title="Invoice Status Distribution" loading={isLoading}>
              {data ? <StatusPieChart data={data.statusDistribution} /> : null}
            </ChartCard>
            <ChartCard title="Invoices Per Day" loading={isLoading}>
              {data ? <InvoicesPerDayChart data={data.invoicesPerDay} /> : null}
            </ChartCard>
            <ChartCard title="Vendor-wise Invoice Count" loading={isLoading}>
              {data ? <VendorInvoiceBarChart data={data.vendorInvoiceCount} /> : null}
            </ChartCard>
            <ChartCard title="Average Processing Time" description="Seconds by day" loading={isLoading}>
              {data ? <ProcessingTimeChart data={data.averageProcessingTime} /> : null}
            </ChartCard>
          </div>
        </>
      )}
    </div>
  );
}
