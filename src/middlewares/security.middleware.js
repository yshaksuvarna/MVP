const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const hpp = require("hpp");

/**
 * Standard API Rate Limiter
 * Limits general API usage
 */
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: {
        success: false,
        message: "Too many requests from this IP, please try again after 15 minutes"
    },
    standardHeaders: true,
    legacyHeaders: false,
});

/**
 * Strict Rate Limiter for Auth routes
 * Prevents brute-force attacks on login/OTP
 */
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Limit each IP to 10 requests per windowMs
    message: {
        success: false,
        message: "Too many authentication attempts, please try again after 15 minutes"
    },
    standardHeaders: true,
    legacyHeaders: false,
});

/**
 * Hardened Helmet configuration
 */
const securityHeaders = helmet({
    contentSecurityPolicy: process.env.NODE_ENV === "production" ? undefined : false,
    crossOriginEmbedderPolicy: false,
});

module.exports = {
    apiLimiter,
    authLimiter,
    securityHeaders,
    parameterPollution: hpp()
};
