import { PageHeader } from "@/components/common/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/store/app-store";
import { toast } from "sonner";

export function SettingsPage() {
  const theme = useAppStore((s) => s.theme);
  const setTheme = useAppStore((s) => s.setTheme);
  const user = useAppStore((s) => s.user);
  const setUser = useAppStore((s) => s.setUser);
  const prefs = useAppStore((s) => s.notificationPrefs);
  const setPrefs = useAppStore((s) => s.setNotificationPrefs);
  const pollingInterval = useAppStore((s) => s.pollingInterval);
  const setPollingInterval = useAppStore((s) => s.setPollingInterval);

  return (
    <div>
      <PageHeader
        title="Settings"
        description="Theme, notifications, and profile preferences (persisted locally)."
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Appearance</CardTitle>
            <CardDescription>Switch between light and dark mode.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="dark-mode">Dark mode</Label>
              <Switch
                id="dark-mode"
                checked={theme === "dark"}
                onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Notification preferences</CardTitle>
            <CardDescription>Control which live toasts appear.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="inv">Invoice updates</Label>
              <Switch
                id="inv"
                checked={prefs.invoiceUpdates}
                onCheckedChange={(v) => setPrefs({ invoiceUpdates: v })}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="ven">Vendor updates</Label>
              <Switch
                id="ven"
                checked={prefs.vendorUpdates}
                onCheckedChange={(v) => setPrefs({ vendorUpdates: v })}
              />
            </div>
            <div className="space-y-2">
              <Label>Fallback polling interval</Label>
              <Select
                value={String(pollingInterval)}
                onValueChange={(v) => setPollingInterval(Number(v))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3000">3 seconds</SelectItem>
                  <SelectItem value="5000">5 seconds</SelectItem>
                  <SelectItem value="10000">10 seconds</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Primary updates use Socket.io; polling interval is stored for future hybrid use.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">User profile</CardTitle>
            <CardDescription>Demo identity shown in the top navigation.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={user.name}
                onChange={(e) => setUser({ name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={user.email}
                onChange={(e) => setUser({ email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select
                value={user.role}
                onValueChange={(v) => setUser({ role: v as "Admin" | "User" })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Admin">Admin</SelectItem>
                  <SelectItem value="User">User</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button
                onClick={() => {
                  setUser({
                    avatarInitials: user.name
                      .split(" ")
                      .map((p) => p[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase(),
                  });
                  toast.success("Profile saved");
                }}
              >
                Save profile
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
