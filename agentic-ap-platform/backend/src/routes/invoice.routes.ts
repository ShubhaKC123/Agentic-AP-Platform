import { Router } from "express";
import multer from "multer";
import { invoiceController } from "../controllers/invoice.controller";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

const router = Router();

router.get("/", invoiceController.list);
router.get("/:id", invoiceController.getById);
router.post("/", upload.single("file"), invoiceController.create);
router.put("/:id", invoiceController.update);
router.delete("/:id", invoiceController.delete);
router.post("/:id/retry", invoiceController.retry);

export default router;
