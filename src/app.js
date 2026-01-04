const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const path = require("path");
const compression = require("compression");
const rateLimit = require("express-rate-limit");

const routes = require("./routes");
const config = require("./config/config");

const app = express();

/* ================= SECURITY ================= */

app.disable("x-powered-by");

app.use(
  helmet({
    contentSecurityPolicy:
      config.app.env === "production" ? undefined : false,
  })
);

/* ================= CORS ================= */

const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",")
  : [];

app.use(
  cors({
    origin: (origin, callback) => {
      // allow server-to-server & tools like curl/postman
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

/* ================= PERFORMANCE ================= */

app.use(compression());

/* ================= BODY PARSERS ================= */

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

/* ================= STATIC FILES ================= */

app.use(express.static(path.join(process.cwd(), "uploads")));

/* ================= HEALTH CHECK ================= */

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "UP",
    timestamp: new Date().toISOString(),
  });
});

/* ================= RATE LIMIT (API ONLY) ================= */

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api", apiLimiter);

/* ================= ROUTES ================= */

app.use("/api", routes);


module.exports = app;
