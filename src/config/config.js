require("dotenv").config();

const required = (key) => {
  if (!process.env[key]) {
    throw new Error(`❌ Missing required env variable: ${key}`);
  }
  return process.env[key];
};

module.exports = {
  app: {
    port: Number(process.env.APP_PORT) || 3000,
    host: process.env.APP_HOST || "0.0.0.0",
    env: process.env.NODE_ENV || "development",
  },

  jwt: {
    secret: required("APP_SECRET_KEY"),
    refreshSecret: required("APP_REFRESH_KEY"),
    expiresIn: process.env.SECRET_KEY_EXP || "2h",
    refreshExpiresIn: process.env.REFRESH_KEY_EXP || "4h",
  },

  db: {
    host: required("DB_HOST"),
    port: Number(process.env.DB_PORT) || 3306,
    user: required("DB_USER"),
    password: process.env.DB_PASSWORD || "",
    database: required("DB_DATABASE"),
  },

  email: {
    user: process.env.EMAIL || "",
    pass: process.env.PASS || "",
  },

  cors: {
    origin: process.env.CORS_ORIGIN
      ? process.env.CORS_ORIGIN.split(",")
      : [],
  },
};
