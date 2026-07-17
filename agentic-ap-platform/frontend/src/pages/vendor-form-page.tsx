import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/common/error-state";
import { VendorForm } from "@/components/vendor/vendor-form";
import { vendorApi } from "@/services/vendor.service";
import type { VendorFormValues } from "@/lib/vendor-schema";

export function VendorCreatePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: vendorApi.create,
    onSuccess: (vendor) => {
      toast.success("Vendor created");
      queryClient.invalidateQueries({ queryKey: ["vendors"] });
      queryClient.invalidateQueries({ queryKey: ["vendor-dashboard"] });
      navigate(`/vendors/${vendor.id}`);
    },
  });

  return (
    <div>
      <PageHeader title="Create Vendor" description="Add a new vendor to the AP master list." />
      <Card>
        <CardContent className="p-6">
          <VendorForm
            submitLabel="Create Vendor"
            submitting={mutation.isPending}
            onSubmit={(values: VendorFormValues) => mutation.mutate(values)}
          />
        </CardContent>
      </Card>
    </div>
  );
}

export function VendorEditPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["vendor", id],
    queryFn: () => vendorApi.getById(id),
    enabled: !!id,
  });

  const mutation = useMutation({
    mutationFn: (values: VendorFormValues) => vendorApi.update(id, values),
    onSuccess: (vendor) => {
      toast.success("Vendor updated");
      queryClient.invalidateQueries({ queryKey: ["vendors"] });
      queryClient.invalidateQueries({ queryKey: ["vendor", id] });
      queryClient.invalidateQueries({ queryKey: ["vendor-dashboard"] });
      navigate(`/vendors/${vendor.id}`);
    },
  });

  if (isLoading) return <Skeleton className="h-96 w-full" />;
  if (isError || !data) return <ErrorState onRetry={() => refetch()} />;

  return (
    <div>
      <PageHeader title={`Edit ${data.name}`} description={data.code} />
      <Card>
        <CardContent className="p-6">
          <VendorForm
            submitLabel="Update Vendor"
            submitting={mutation.isPending}
            defaultValues={{
              name: data.name,
              code: data.code,
              gstNumber: data.gstNumber,
              panNumber: data.panNumber,
              email: data.email,
              phone: data.phone,
              country: data.country,
              status: data.status,
            }}
            onSubmit={(values) => mutation.mutate(values)}
          />
        </CardContent>
      </Card>
    </div>
  );
}
