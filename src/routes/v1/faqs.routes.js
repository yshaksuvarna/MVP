const router = require("express").Router();
const faqController = require("../../controllers/faqs.controller");
const validate = require("../../middlewares/validate.middleware");
const { faqValidator } = require("../../validators/faqs.validator");

router.post("/", faqValidator, validate, faqController.create);
router.get("/", faqController.list);
router.get("/:id", faqController.getOne);
router.put("/:id", faqValidator, validate, faqController.update);
router.delete("/:id", faqController.remove);

module.exports = router;
