const express = require("express");
const cors = require("cors");
const path = require("path");
const compression = require("compression");
const { securityHeaders, apiLimiter, parameterPollution } = require("./middlewares/security.middleware");

const routes = require("./routes");
const config = require("./config/config");

const app = express();

/* ================= SECURITY & PERFORMANCE ================= */

// app.disable("x-powered-by");
// app.use(securityHeaders);
// app.use(parameterPollution);
app.use(compression());

/* ================= CORS ================= */

app.use(
  cors({
    origin: true, // Reflects the request origin, allowing any domain to access
    credentials: true,
  })
);

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

/* ================= API LIMITER ================= */

app.use("/api", apiLimiter);

/* ================= ROUTES ================= */

app.use("/api", routes);

module.exports = app;
