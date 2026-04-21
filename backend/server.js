import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import expenseRoutes from "./routes/expenseRoutes.js";

dotenv.config();
connectDB();

const app = express();


// middleware
app.use(
  cors({
    origin:
      "https://expense-tracker-oai49l4wt-abirmondal7864s-projects.vercel.app/login",
    credentials: true,
  }),
);
app.use(express.json());

// routes
app.use("/api/auth", authRoutes);
app.use("/api/expenses", expenseRoutes);

app.get("/", (req, res) => {
  res.send("API Running...");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
