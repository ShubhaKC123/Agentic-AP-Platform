import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { statusLabel } from "@/lib/utils";
import type { InvoiceStatus } from "@/types";

const COLORS = [
  "#64748b",
  "#0ea5e9",
  "#06b6d4",
  "#6366f1",
  "#8b5cf6",
  "#f59e0b",
  "#f97316",
  "#10b981",
  "#f43f5e",
];

export function StatusPieChart({
  data,
}: {
  data: { status: InvoiceStatus; count: number }[];
}) {
  const chartData = data.filter((d) => d.count > 0).map((d) => ({
    name: statusLabel(d.status),
    value: d.count,
  }));

  if (chartData.length === 0) {
    return <p className="py-16 text-center text-sm text-muted-foreground">No data</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie data={chartData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={95} paddingAngle={2}>
          {chartData.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
