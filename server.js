const http = require("http");
const config = require("./src/config/config");
const app = require("./src/app");
const { closeDB } = require("./src/config/db");

const server = http.createServer(app);
let isShuttingDown = false;

/* ================= START SERVER ================= */

server.listen(config.app.port, config.app.host, () => {
  console.log(
    `🚀 Server running at http://${config.app.host}:${config.app.port}`
  );
});

/* ================= SERVER ERROR ================= */

server.on("error", (err) => {
  console.error("❌ Server startup error:", err);
  process.exit(1);
});

/* ================= GRACEFUL SHUTDOWN ================= */

const shutdown = async (signal) => {
  if (isShuttingDown) return;
  isShuttingDown = true;

  console.log(`🛑 Received ${signal}. Shutting down gracefully...`);

  server.close(async () => {
    console.log("✅ HTTP server closed");

    try {
      await closeDB();
      console.log("✅ Resources closed");
    } catch (err) {
      console.error("❌ Error while closing resources:", err);
    }

    process.exit(0);
  });

  // Force exit after 10 seconds
  setTimeout(() => {
    console.error("⏱ Force shutdown");
    process.exit(1);
  }, 10000).unref();
};

/* ================= SIGNAL HANDLING ================= */

process.on("SIGINT", shutdown);   // Ctrl + C
process.on("SIGTERM", shutdown);  // Docker / Kubernetes

/* ================= FATAL ERRORS ================= */

/**
 * Uncaught Exception
 * App state is unsafe → exit immediately
 */
process.on("uncaughtException", (err) => {
  console.error("🔥 Uncaught Exception:", err);
  process.exit(1);
});

/**
 * Unhandled Promise Rejection
 * Treat as fatal
 */
process.on("unhandledRejection", (reason) => {
  console.error("🔥 Unhandled Rejection:", reason);
  process.exit(1);
});
