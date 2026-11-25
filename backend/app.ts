import express, { type Request, type Response } from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import expenseRoutes from "./routes/expenseRoutes.js";

const app = express();

// middleware
app.use(
  cors({
    origin: (_origin, callback) => {
      // Allow all origins in production
      callback(null, true);
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
