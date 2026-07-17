import { invoiceService } from "./invoice.service";

let intervalId: NodeJS.Timeout | null = null;

export function startProcessingPipeline(intervalMs = 3000) {
  if (intervalId) return;

  console.log(`Starting invoice processing pipeline (every ${intervalMs}ms)`);

  intervalId = setInterval(() => {
    try {
      const updated = invoiceService.advanceProcessing();
      if (updated.length > 0) {
        console.log(`Advanced ${updated.length} invoice(s)`);
      }
    } catch (err) {
      console.error("Pipeline error:", err);
    }
  }, intervalMs);
}

export function stopProcessingPipeline() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
}
