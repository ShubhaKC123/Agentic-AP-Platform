import { useQuery } from "@tanstack/react-query";
import { Building2, CheckCircle2, Clock3, PauseCircle, RefreshCw } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { StatCard } from "@/components/common/stat-card";
import { ErrorState } from "@/components/common/error-state";
import { ChartCard } from "@/components/charts/chart-card";
import {
  CountryDistributionChart,
  MonthlyCreationChart,
  TopVendorsChart,
} from "@/components/charts/bar-line-charts";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { vendorApi } from "@/services/vendor.service";

export function VendorDashboardPage() {
  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["vendor-dashboard"],
    queryFn: vendorApi.dashboard,
  });

  return (
    <div>
      <PageHeader
        title="Vendor Dashboard"
        description="Vendor health, geography, and invoice volume leaders."
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
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {isLoading || !data
              ? Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-28 rounded-xl" />
                ))
              : (
                <>
                  <StatCard title="Total Vendors" value={data.totalVendors} icon={Building2} index={0} />
                  <StatCard title="Active" value={data.active} icon={CheckCircle2} index={1} />
                  <StatCard title="Inactive" value={data.inactive} icon={PauseCircle} index={2} />
                  <StatCard title="Awaiting Approval" value={data.pending} icon={Clock3} index={3} />
                </>
              )}
          </div>

          <div className="mt-6 grid gap-4 xl:grid-cols-2">
            <ChartCard title="Vendor Country Distribution" loading={isLoading}>
              {data ? <CountryDistributionChart data={data.countryDistribution} /> : null}
            </ChartCard>
            <ChartCard title="Monthly Vendor Creation" loading={isLoading}>
              {data ? <MonthlyCreationChart data={data.monthlyCreation} /> : null}
            </ChartCard>
            <div className="xl:col-span-2">
              <ChartCard title="Top Vendors by Invoice Count" loading={isLoading}>
                {data ? <TopVendorsChart data={data.topVendors} /> : null}
              </ChartCard>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
