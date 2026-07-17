import { Request, Response, NextFunction } from "express";

export class AppError extends Error {
  statusCode: number;

  constructor(message: string, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}

export function errorHandler(
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  const statusCode = err instanceof AppError ? err.statusCode : 500;
  console.error(err);
  res.status(statusCode).json({
    error: err.message || "Internal Server Error",
    statusCode,
  });
}

export function notFoundHandler(_req: Request, res: Response) {
  res.status(404).json({ error: "Not Found", statusCode: 404 });
}
