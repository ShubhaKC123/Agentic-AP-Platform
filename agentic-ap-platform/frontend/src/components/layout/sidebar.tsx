import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Upload,
  FileText,
  Bell,
  Building2,
  PieChart,
  Settings,
  X,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/app-store";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/invoices/upload", label: "Invoice Upload", icon: Upload },
  { to: "/invoices", label: "Invoices", icon: FileText },
  { to: "/notifications", label: "Notifications", icon: Bell },
  { to: "/vendors", label: "Vendors", icon: Building2 },
  { to: "/vendor-dashboard", label: "Vendor Dashboard", icon: PieChart },
  { to: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const sidebarOpen = useAppStore((s) => s.sidebarOpen);
  const setSidebarOpen = useAppStore((s) => s.setSidebarOpen);
  const collapsed = useAppStore((s) => s.sidebarCollapsed);
  const toggleCollapsed = useAppStore((s) => s.toggleSidebarCollapsed);
  const unreadCount = useAppStore((s) => s.unreadCount);

  const content = (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center justify-between border-b px-4">
        <div className="flex items-center gap-2 overflow-hidden">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
            AP
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">Agentic AP</p>
              <p className="truncate text-[11px] text-muted-foreground">Invoice Platform</p>
            </div>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="hidden lg:flex"
            onClick={toggleCollapsed}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronsRight className="h-4 w-4" /> : <ChevronsLeft className="h-4 w-4" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1" aria-label="Main">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors focus-ring",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  collapsed && "justify-center px-2"
                )
              }
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
              {!collapsed && item.to === "/notifications" && unreadCount > 0 ? (
                <span className="ml-auto rounded-full bg-primary px-1.5 py-0.5 text-[10px] text-primary-foreground">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              ) : null}
            </NavLink>
          ))}
        </nav>
      </ScrollArea>

      {!collapsed && (
        <div className="border-t p-4">
          <div className="rounded-lg bg-muted/60 p-3">
            <p className="text-xs font-medium">AI Processing Active</p>
            <p className="mt-1 text-[11px] text-muted-foreground">
              Real-time invoice pipeline via Socket.io
            </p>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      <aside
        className={cn(
          "sticky top-0 hidden h-screen border-r bg-card/80 backdrop-blur lg:flex lg:flex-col",
          collapsed ? "w-[72px]" : "w-64"
        )}
      >
        {content}
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            className="absolute inset-0 bg-black/50"
            aria-label="Close menu overlay"
            onClick={() => setSidebarOpen(false)}
          />
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            className="absolute left-0 top-0 h-full w-72 border-r bg-card shadow-xl"
          >
            {content}
          </motion.aside>
        </div>
      )}
    </>
  );
}
