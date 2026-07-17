import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { FileText, Building2, Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useAppStore } from "@/store/app-store";
import { searchApi } from "@/services/search.service";
import { ScrollArea } from "@/components/ui/scroll-area";

export function CommandPalette() {
  const open = useAppStore((s) => s.commandPaletteOpen);
  const setOpen = useAppStore((s) => s.setCommandPaletteOpen);
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(!open);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, setOpen]);

  const { data } = useQuery({
    queryKey: ["search", query],
    queryFn: () => searchApi.global(query),
    enabled: open && query.trim().length >= 2,
  });

  const go = (path: string) => {
    setOpen(false);
    setQuery("");
    navigate(path);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-xl">
        <DialogHeader className="sr-only">
          <DialogTitle>Command palette</DialogTitle>
        </DialogHeader>
        <div className="flex items-center gap-2 border-b px-3">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search invoices and vendors…"
            className="border-0 shadow-none focus-visible:ring-0"
          />
        </div>
        <ScrollArea className="max-h-80">
          <div className="p-2">
            <p className="px-2 py-1.5 text-xs font-medium text-muted-foreground">Quick links</p>
            <button
              className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-muted"
              onClick={() => go("/invoices/upload")}
            >
              <FileText className="h-4 w-4" /> Upload invoice
            </button>
            <button
              className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-muted"
              onClick={() => go("/vendors/new")}
            >
              <Building2 className="h-4 w-4" /> Create vendor
            </button>

            {data?.invoices?.length ? (
              <>
                <p className="mt-2 px-2 py-1.5 text-xs font-medium text-muted-foreground">Invoices</p>
                {data.invoices.map((inv) => (
                  <button
                    key={inv.id}
                    className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm hover:bg-muted"
                    onClick={() => go(`/invoices/${inv.id}`)}
                  >
                    <FileText className="h-4 w-4 shrink-0" />
                    <span className="truncate">
                      {inv.invoiceNumber} · {inv.vendorName}
                    </span>
                  </button>
                ))}
              </>
            ) : null}

            {data?.vendors?.length ? (
              <>
                <p className="mt-2 px-2 py-1.5 text-xs font-medium text-muted-foreground">Vendors</p>
                {data.vendors.map((v) => (
                  <button
                    key={v.id}
                    className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm hover:bg-muted"
                    onClick={() => go(`/vendors/${v.id}`)}
                  >
                    <Building2 className="h-4 w-4 shrink-0" />
                    <span className="truncate">
                      {v.name} · {v.code}
                    </span>
                  </button>
                ))}
              </>
            ) : null}

            {query.trim().length >= 2 && !data?.invoices?.length && !data?.vendors?.length ? (
              <p className="px-2 py-6 text-center text-sm text-muted-foreground">No results</p>
            ) : null}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
