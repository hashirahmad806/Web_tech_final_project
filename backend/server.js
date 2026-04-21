import "dotenv/config";
import express from "express";
import cors from "cors";
import connectDB from "./src/config/db.js";
import chatRoutes from "./src/routes/chatRoutes.js";
import uploadRoutes from "./src/routes/uploadRoutes.js";
import historyRoutes from "./src/routes/historyRoutes.js";

const app = express();
const PORT = process.env.PORT || 5000;

await connectDB();

const allowedOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(",").map((origin) => origin.trim())
  : ["http://localhost:5173"];

app.use(
  cors({
    origin: allowedOrigins,
  }),
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, message: "AI Student Assistant API is running." });
});

app.use("/api/chat", chatRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/history", historyRoutes);

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(error.statusCode || 500).json({
    message: error.message || "Internal server error",
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
