import { Request, Response, NextFunction } from "express";
import { vendorService } from "../services/vendor.service";
import { AppError } from "../middleware/errorHandler";

export const vendorController = {
  list(req: Request, res: Response, next: NextFunction) {
    try {
      const result = vendorService.list({
        page: Number(req.query.page) || 1,
        pageSize: Number(req.query.pageSize) || 10,
        search: req.query.search as string | undefined,
        status: req.query.status as string | undefined,
        country: req.query.country as string | undefined,
        sortBy: req.query.sortBy as string | undefined,
        sortOrder: (req.query.sortOrder as "asc" | "desc") || "desc",
      });
      res.json(result);
    } catch (err) {
      next(err);
    }
  },

  getById(req: Request, res: Response, next: NextFunction) {
    try {
      const vendor = vendorService.getById(req.params.id);
      if (!vendor) throw new AppError("Vendor not found", 404);
      res.json(vendor);
    } catch (err) {
      next(err);
    }
  },

  create(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, code, gstNumber, panNumber, email, phone, country, status } = req.body;
      if (!name || !code || !gstNumber || !panNumber || !email || !phone || !country) {
        throw new AppError("Missing required vendor fields", 400);
      }
      const vendor = vendorService.create({
        name,
        code,
        gstNumber,
        panNumber,
        email,
        phone,
        country,
        status,
      });
      res.status(201).json(vendor);
    } catch (err) {
      if (err instanceof Error && err.message.includes("already exists")) {
        next(new AppError(err.message, 409));
        return;
      }
      next(err);
    }
  },

  update(req: Request, res: Response, next: NextFunction) {
    try {
      const vendor = vendorService.update(req.params.id, req.body);
      if (!vendor) throw new AppError("Vendor not found", 404);
      res.json(vendor);
    } catch (err) {
      if (err instanceof Error && err.message.includes("already exists")) {
        next(new AppError(err.message, 409));
        return;
      }
      next(err);
    }
  },

  delete(req: Request, res: Response, next: NextFunction) {
    try {
      const ok = vendorService.delete(req.params.id);
      if (!ok) throw new AppError("Vendor not found", 404);
      res.json({ success: true });
    } catch (err) {
      next(err);
    }
  },

  dashboard(_req: Request, res: Response, next: NextFunction) {
    try {
      res.json(vendorService.getDashboard());
    } catch (err) {
      next(err);
    }
  },
};
