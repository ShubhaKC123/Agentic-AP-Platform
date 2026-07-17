import { Router } from "express";
import { notificationController } from "../controllers/notification.controller";

const router = Router();

router.get("/", notificationController.list);
router.get("/unread-count", notificationController.unreadCount);
router.post("/:id/read", notificationController.markAsRead);
router.post("/read-all", notificationController.markAllAsRead);
router.delete("/", notificationController.clearAll);

export default router;
