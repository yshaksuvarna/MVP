const router = require("express").Router();
const currentAffairs = require("../../controllers/currentAffairs.controller");
const validate = require("../../middlewares/validate.middleware");
const { currentAffairValidator } = require("../../validators/currentAffairs.validator");

router.post("/", currentAffairValidator, validate, currentAffairs.create);
router.put("/:id", currentAffairValidator, validate, currentAffairs.update);
router.delete("/:id", currentAffairs.remove);

router.get("/", currentAffairs.list);

module.exports = router;
