import { Request, Response, NextFunction } from "express";
import { invoiceService } from "../services/invoice.service";
import { AppError } from "../middleware/errorHandler";

export const invoiceController = {
  list(req: Request, res: Response, next: NextFunction) {
    try {
      const result = invoiceService.list({
        page: Number(req.query.page) || 1,
        pageSize: Number(req.query.pageSize) || 10,
        search: req.query.search as string | undefined,
        status: req.query.status as string | undefined,
        vendorId: req.query.vendorId as string | undefined,
        currency: req.query.currency as string | undefined,
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
      const invoice = invoiceService.getById(req.params.id);
      if (!invoice) throw new AppError("Invoice not found", 404);
      res.json(invoice);
    } catch (err) {
      next(err);
    }
  },

  create(req: Request, res: Response, next: NextFunction) {
    try {
      const file = req.file;
      if (!file) throw new AppError("No file uploaded", 400);

      const allowed = ["application/pdf", "image/png", "image/jpeg", "image/jpg"];
      if (!allowed.includes(file.mimetype)) {
        throw new AppError("Only PDF, PNG, and JPG files are allowed", 400);
      }

      const invoice = invoiceService.create({
        fileName: file.originalname,
        fileType: file.mimetype,
        vendorId: req.body.vendorId,
        amount: req.body.amount ? Number(req.body.amount) : undefined,
        currency: req.body.currency,
      });

      res.status(201).json({
        invoiceId: invoice.id,
        status: invoice.status,
        invoice,
      });
    } catch (err) {
      next(err);
    }
  },

  update(req: Request, res: Response, next: NextFunction) {
    try {
      const invoice = invoiceService.update(req.params.id, req.body);
      if (!invoice) throw new AppError("Invoice not found", 404);
      res.json(invoice);
    } catch (err) {
      next(err);
    }
  },

  delete(req: Request, res: Response, next: NextFunction) {
    try {
      const ok = invoiceService.delete(req.params.id);
      if (!ok) throw new AppError("Invoice not found", 404);
      res.json({ success: true });
    } catch (err) {
      next(err);
    }
  },

  retry(req: Request, res: Response, next: NextFunction) {
    try {
      const invoice = invoiceService.retry(req.params.id);
      if (!invoice) throw new AppError("Invoice not found", 404);
      res.json(invoice);
    } catch (err) {
      next(err);
    }
  },

  dashboard(_req: Request, res: Response, next: NextFunction) {
    try {
      res.json(invoiceService.getDashboard());
    } catch (err) {
      next(err);
    }
  },
};
