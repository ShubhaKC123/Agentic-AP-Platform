import express from "express";
import cors from "cors";
import http from "http";
import path from "path";
import fs from "fs";
import routes from "./routes";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import { initIO } from "./socket/io";
import {
  startProcessingPipeline,
  stopProcessingPipeline,
} from "./services/pipeline.service";
import { generateSeedData } from "./mock/seed";

const PORT = Number(process.env.PORT) || 4000;

const dataDir =
  process.env.DATA_DIR || path.resolve(__dirname, "..", "data");
const invoicesPath = path.join(dataDir, "invoices.json");

if (!fs.existsSync(invoicesPath)) {
  console.log("No seed data found. Generating mock data...");
  generateSeedData();
}

const app = express();
const server = http.createServer(app);

initIO(server);

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", routes);

app.use(notFoundHandler);
app.use(errorHandler);

server.listen(PORT, () => {
  console.log(`Agentic AP Backend running on http://localhost:${PORT}`);
  console.log(`Socket.io ready`);
  startProcessingPipeline(3000);
});

function shutdown(signal: string) {
  console.log(`Received ${signal}, shutting down...`);
  stopProcessingPipeline();
  server.close(() => process.exit(0));
  // Force exit if close hangs (open sockets)
  setTimeout(() => process.exit(0), 1500).unref();
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
