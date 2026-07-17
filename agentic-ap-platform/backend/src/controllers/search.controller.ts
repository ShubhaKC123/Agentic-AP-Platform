import { Request, Response, NextFunction } from "express";
import { invoiceService } from "../services/invoice.service";
import { vendorService } from "../services/vendor.service";

export const searchController = {
  global(req: Request, res: Response, next: NextFunction) {
    try {
      const q = String(req.query.q ?? "").trim();
      if (!q) {
        res.json({ invoices: [], vendors: [] });
        return;
      }
      res.json({
        invoices: invoiceService.searchAll(q),
        vendors: vendorService.searchAll(q),
      });
    } catch (err) {
      next(err);
    }
  },
};
