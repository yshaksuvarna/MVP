const router = require("express").Router();
const faqController = require("../../controllers/faqs.controller");

router.post("/", faqController.create);
router.get("/", faqController.list);
router.get("/:id", faqController.getOne);
router.put("/:id", faqController.update);
router.delete("/:id", faqController.remove);

module.exports = router;
