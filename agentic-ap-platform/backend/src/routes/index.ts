import { Router } from "express";
import invoiceRoutes from "./invoice.routes";
import vendorRoutes from "./vendor.routes";
import notificationRoutes from "./notification.routes";
import { invoiceController } from "../controllers/invoice.controller";
import { vendorController } from "../controllers/vendor.controller";
import { searchController } from "../controllers/search.controller";

const router = Router();

router.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "agentic-ap-backend" });
});

router.use("/invoices", invoiceRoutes);
router.use("/vendors", vendorRoutes);
router.use("/notifications", notificationRoutes);
router.get("/dashboard", invoiceController.dashboard);
router.get("/vendor-dashboard", vendorController.dashboard);
router.get("/search", searchController.global);

export default router;
