const router = require("express").Router();
const { payloadCheck } = require("../../middlewares");
const { notFoundHandler, errorHandler } = require("../../middlewares/error.middleware");
const { authLimiter } = require("../../middlewares/security.middleware");

router.use(payloadCheck);

router.use("/auth", authLimiter, require("./auth.routes"));
router.use("/user", require("./user.routes"));
router.use("/location", require("./location.routes"));
router.use("/course", require("./course.routes"));
router.use("/banner", require("./banner.routes"));
router.use("/faqs", require("./faqs.routes"));
router.use("/contactInfo", require("./contactInfo.routes"));
router.use("/toppers", require("./toppers.routes"));
router.use("/current-affairs", require("./currentAffairs.routes"));

router.use(notFoundHandler);
router.use(errorHandler);

module.exports = router;
