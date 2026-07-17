import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UserProfile {
  name: string;
  email: string;
  role: "Admin" | "User";
  avatarInitials: string;
}

interface AppState {
  theme: "light" | "dark";
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  notificationDrawerOpen: boolean;
  unreadCount: number;
  commandPaletteOpen: boolean;
  user: UserProfile;
  notificationPrefs: {
    invoiceUpdates: boolean;
    vendorUpdates: boolean;
    sound: boolean;
  };
  pollingInterval: number;
  setTheme: (theme: "light" | "dark") => void;
  toggleTheme: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebarCollapsed: () => void;
  setNotificationDrawerOpen: (open: boolean) => void;
  setUnreadCount: (count: number) => void;
  setCommandPaletteOpen: (open: boolean) => void;
  setUser: (user: Partial<UserProfile>) => void;
  setNotificationPrefs: (prefs: Partial<AppState["notificationPrefs"]>) => void;
  setPollingInterval: (ms: number) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      theme: "light",
      sidebarOpen: false,
      sidebarCollapsed: false,
      notificationDrawerOpen: false,
      unreadCount: 0,
      commandPaletteOpen: false,
      user: {
        name: "Alex Morgan",
        email: "alex.morgan@agenticap.io",
        role: "Admin",
        avatarInitials: "AM",
      },
      notificationPrefs: {
        invoiceUpdates: true,
        vendorUpdates: true,
        sound: false,
      },
      pollingInterval: 5000,
      setTheme: (theme) => {
        set({ theme });
        document.documentElement.classList.toggle("dark", theme === "dark");
      },
      toggleTheme: () => {
        const next = get().theme === "light" ? "dark" : "light";
        get().setTheme(next);
      },
      setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
      toggleSidebarCollapsed: () =>
        set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setNotificationDrawerOpen: (notificationDrawerOpen) =>
        set({ notificationDrawerOpen }),
      setUnreadCount: (unreadCount) => set({ unreadCount }),
      setCommandPaletteOpen: (commandPaletteOpen) => set({ commandPaletteOpen }),
      setUser: (user) => set((s) => ({ user: { ...s.user, ...user } })),
      setNotificationPrefs: (prefs) =>
        set((s) => ({
          notificationPrefs: { ...s.notificationPrefs, ...prefs },
        })),
      setPollingInterval: (pollingInterval) => set({ pollingInterval }),
    }),
    {
      name: "agentic-ap-store",
      partialize: (state) => ({
        theme: state.theme,
        sidebarCollapsed: state.sidebarCollapsed,
        user: state.user,
        notificationPrefs: state.notificationPrefs,
        pollingInterval: state.pollingInterval,
      }),
    }
  )
);
