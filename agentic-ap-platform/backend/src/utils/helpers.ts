export function paginate<T>(
  items: T[],
  page: number,
  pageSize: number
): { data: T[]; total: number; page: number; pageSize: number; totalPages: number } {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * pageSize;
  return {
    data: items.slice(start, start + pageSize),
    total,
    page: safePage,
    pageSize,
    totalPages,
  };
}

export function sortBy<T>(
  items: T[],
  sortByField: string | undefined,
  sortOrder: "asc" | "desc" = "desc"
): T[] {
  if (!sortByField) return items;
  const sorted = [...items].sort((a, b) => {
    const aVal = (a as Record<string, unknown>)[sortByField];
    const bVal = (b as Record<string, unknown>)[sortByField];
    if (aVal == null && bVal == null) return 0;
    if (aVal == null) return 1;
    if (bVal == null) return -1;
    if (typeof aVal === "number" && typeof bVal === "number") {
      return aVal - bVal;
    }
    return String(aVal).localeCompare(String(bVal), undefined, { numeric: true });
  });
  return sortOrder === "asc" ? sorted : sorted.reverse();
}

export function formatDate(d: Date): string {
  return d.toISOString();
}

export function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}
