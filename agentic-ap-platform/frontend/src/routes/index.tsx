import { Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "@/components/layout/app-shell";
import { DashboardPage } from "@/pages/dashboard-page";
import { InvoiceUploadPage } from "@/pages/invoice-upload-page";
import { InvoicesPage } from "@/pages/invoices-page";
import { InvoiceDetailPage } from "@/pages/invoice-detail-page";
import { VendorsPage } from "@/pages/vendors-page";
import { VendorCreatePage, VendorEditPage } from "@/pages/vendor-form-page";
import { VendorDetailPage } from "@/pages/vendor-detail-page";
import { VendorDashboardPage } from "@/pages/vendor-dashboard-page";
import { NotificationsPage } from "@/pages/notifications-page";
import { SettingsPage } from "@/pages/settings-page";
import { NotFoundPage } from "@/pages/not-found-page";

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<DashboardPage />} />
        <Route path="invoices" element={<InvoicesPage />} />
        <Route path="invoices/upload" element={<InvoiceUploadPage />} />
        <Route path="invoices/:id" element={<InvoiceDetailPage />} />
        <Route path="vendors" element={<VendorsPage />} />
        <Route path="vendors/new" element={<VendorCreatePage />} />
        <Route path="vendors/:id" element={<VendorDetailPage />} />
        <Route path="vendors/:id/edit" element={<VendorEditPage />} />
        <Route path="vendor-dashboard" element={<VendorDashboardPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="dashboard" element={<Navigate to="/" replace />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
