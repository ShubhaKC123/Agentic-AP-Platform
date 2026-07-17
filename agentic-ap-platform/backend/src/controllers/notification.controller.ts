import { Request, Response, NextFunction } from "express";
import { notificationService } from "../services/notification.service";
import { AppError } from "../middleware/errorHandler";

export const notificationController = {
  list(req: Request, res: Response, next: NextFunction) {
    try {
      const result = notificationService.list({
        page: Number(req.query.page) || 1,
        pageSize: Number(req.query.pageSize) || 20,
        unreadOnly: req.query.unreadOnly === "true",
      });
      res.json({
        ...result,
        unreadCount: notificationService.unreadCount(),
      });
    } catch (err) {
      next(err);
    }
  },

  markAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const notification = notificationService.markAsRead(req.params.id);
      if (!notification) throw new AppError("Notification not found", 404);
      res.json(notification);
    } catch (err) {
      next(err);
    }
  },

  markAllAsRead(_req: Request, res: Response, next: NextFunction) {
    try {
      const count = notificationService.markAllAsRead();
      res.json({ success: true, count });
    } catch (err) {
      next(err);
    }
  },

  clearAll(_req: Request, res: Response, next: NextFunction) {
    try {
      notificationService.clearAll();
      res.json({ success: true });
    } catch (err) {
      next(err);
    }
  },

  unreadCount(_req: Request, res: Response, next: NextFunction) {
    try {
      res.json({ count: notificationService.unreadCount() });
    } catch (err) {
      next(err);
    }
  },
};
