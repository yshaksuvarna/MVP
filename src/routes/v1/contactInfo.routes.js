const router = require("express").Router();
const contactController = require("../../controllers/contactInfo.controller");

router.post("/", contactController.create);
router.get("/", contactController.get);
router.put("/", contactController.update);

module.exports = router;
