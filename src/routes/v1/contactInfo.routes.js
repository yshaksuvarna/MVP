const router = require("express").Router();
const contactController = require("../../controllers/contactInfo.controller");
const validate = require("../../middlewares/validate.middleware");
const { contactInfoValidator } = require("../../validators/contactInfo.validator");

router.post("/", contactInfoValidator, validate, contactController.create);
router.get("/", contactController.get);
router.put("/", contactInfoValidator, validate, contactController.update);

module.exports = router;
