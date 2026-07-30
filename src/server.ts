import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import { requestLogger } from "./middleware/requestLogger";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import geographyRouter from "./routes/geography";
import electoralRouter from "./routes/electoral";
import institutionsRouter from "./routes/institutions";
import authRouter from "./routes/auth";
import fusionRouter from "./routes/fusion";

dotenv.config();

const app = express();
app.set("trust proxy", 1);

const defaultOrigins = [
  "https://ginis.aiei-africa.org",
  "http://localhost:3000",
];

const allowedOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(",").map((o) => o.trim())
  : defaultOrigins;

app.use(cors({
  origin: allowedOrigins,
}));

app.use(express.json());
app.use(requestLogger);
app.use(rateLimit({ windowMs: 60_000, max: 300, standardHeaders: true, legacyHeaders: false }));

app.get("/health", (_req, res) => {
  res.json({ service: "ginis-api", status: "ok", operator: "AIEI" });
});

app.use("/geography", geographyRouter);
app.use("/electoral", electoralRouter);
app.use("/institutions", institutionsRouter);
app.use("/auth", authRouter);
app.use("/fusion", fusionRouter);

app.use(notFoundHandler);
app.use(errorHandler);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`ginis-api listening on port ${PORT}`);
});
