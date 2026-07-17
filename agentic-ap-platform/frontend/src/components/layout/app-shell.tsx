import { Outlet } from "react-router-dom";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import { NotificationDrawer } from "@/components/notifications/notification-drawer";
import { CommandPalette } from "@/components/common/command-palette";
import { useRealtimeUpdates } from "@/hooks/use-socket";
import { useThemeInit } from "@/hooks/use-theme";

export function AppShell() {
  useThemeInit();
  useRealtimeUpdates();

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
      <NotificationDrawer />
      <CommandPalette />
    </div>
  );
}
