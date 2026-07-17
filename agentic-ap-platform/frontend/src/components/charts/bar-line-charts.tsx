import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export function InvoicesPerDayChart({ data }: { data: { date: string; count: number }[] }) {
  if (!data.length) return <p className="py-16 text-center text-sm text-muted-foreground">No data</p>;
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
        <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(v) => v.slice(5)} />
        <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
        <Tooltip />
        <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function VendorInvoiceBarChart({
  data,
}: {
  data: { vendorName: string; count: number }[];
}) {
  if (!data.length) return <p className="py-16 text-center text-sm text-muted-foreground">No data</p>;
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} layout="vertical" margin={{ left: 20 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
        <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
        <YAxis
          type="category"
          dataKey="vendorName"
          width={110}
          tick={{ fontSize: 10 }}
          tickFormatter={(v) => (v.length > 14 ? `${v.slice(0, 14)}…` : v)}
        />
        <Tooltip />
        <Bar dataKey="count" fill="hsl(var(--chart-2))" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function ProcessingTimeChart({
  data,
}: {
  data: { date: string; avgMs: number }[];
}) {
  const chartData = data.map((d) => ({
    date: d.date,
    seconds: Math.round(d.avgMs / 1000),
  }));
  if (!chartData.length)
    return <p className="py-16 text-center text-sm text-muted-foreground">No data</p>;
  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
        <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(v) => v.slice(5)} />
        <YAxis tick={{ fontSize: 11 }} unit="s" />
        <Tooltip />
        <Line
          type="monotone"
          dataKey="seconds"
          stroke="hsl(var(--chart-4))"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function CountryDistributionChart({
  data,
}: {
  data: { country: string; count: number }[];
}) {
  if (!data.length) return <p className="py-16 text-center text-sm text-muted-foreground">No data</p>;
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
        <XAxis dataKey="country" tick={{ fontSize: 10 }} interval={0} angle={-25} textAnchor="end" height={70} />
        <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
        <Tooltip />
        <Bar dataKey="count" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function MonthlyCreationChart({
  data,
}: {
  data: { month: string; count: number }[];
}) {
  if (!data.length) return <p className="py-16 text-center text-sm text-muted-foreground">No data</p>;
  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
        <XAxis dataKey="month" tick={{ fontSize: 11 }} />
        <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
        <Tooltip />
        <Line type="monotone" dataKey="count" stroke="hsl(var(--chart-2))" strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function TopVendorsChart({
  data,
}: {
  data: { vendorName: string; invoiceCount: number }[];
}) {
  if (!data.length) return <p className="py-16 text-center text-sm text-muted-foreground">No data</p>;
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} layout="vertical" margin={{ left: 20 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
        <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
        <YAxis
          type="category"
          dataKey="vendorName"
          width={110}
          tick={{ fontSize: 10 }}
          tickFormatter={(v) => (v.length > 14 ? `${v.slice(0, 14)}…` : v)}
        />
        <Tooltip />
        <Bar dataKey="invoiceCount" fill="hsl(var(--chart-3))" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
