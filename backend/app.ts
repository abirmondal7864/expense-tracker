import express, { type Request, type Response } from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import expenseRoutes from "./routes/expenseRoutes.js";

const DEFAULT_ALLOWED_ORIGINS = [
  "https://expense-tracker-xi-blue-21.vercel.app",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
];

export const getAllowedOrigins = (): string[] => {
  const origins = [...DEFAULT_ALLOWED_ORIGINS];
  const envFrontendUrl = process.env.FRONTEND_URL?.trim().replace(/\/+$/, "");

  if (envFrontendUrl && !origins.includes(envFrontendUrl)) {
    origins.push(envFrontendUrl);
  }

  return origins;
};

const app = express();

// middleware
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no Origin header (e.g., server-to-server, curl, tests)
      if (!origin) {
        callback(null, true);
        return;
      }

      const normalizedOrigin = origin.replace(/\/+$/, "");
      if (getAllowedOrigins().includes(normalizedOrigin)) {
        callback(null, true);
        return;
      }

      callback(new Error(`CORS policy: Origin ${origin} is not allowed`));
    },
    credentials: true,
  })
);

app.use(express.json());

// routes
app.use("/api/auth", authRoutes);
app.use("/api/expenses", expenseRoutes);

app.get("/", (_req: Request, res: Response) => {
  res.send("API Running...");
});

export default app;
