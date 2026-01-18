const router = require("express").Router();
const contactController = require("../../controllers/contactInfo.controller");
const validate = require("../../middlewares/validate.middleware");
const { contactInfoValidator } = require("../../validators/contactInfo.validator");

router.post("/", contactInfoValidator, validate, contactController.create);
router.get("/", contactController.get);
router.put("/:id", contactInfoValidator, validate, contactController.update);
router.delete("/:id", contactController.remove);

module.exports = router;
