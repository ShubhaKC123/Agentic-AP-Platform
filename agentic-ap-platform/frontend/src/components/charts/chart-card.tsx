import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { ReactNode } from "react";

interface ChartCardProps {
  title: string;
  description?: string;
  loading?: boolean;
  children: ReactNode;
  action?: ReactNode;
}

export function ChartCard({ title, description, loading, children, action }: ChartCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between space-y-0">
        <div>
          <CardTitle className="text-base">{title}</CardTitle>
          {description ? <CardDescription className="mt-1">{description}</CardDescription> : null}
        </div>
        {action}
      </CardHeader>
      <CardContent>
        {loading ? <Skeleton className="h-[260px] w-full" /> : children}
      </CardContent>
    </Card>
  );
}
