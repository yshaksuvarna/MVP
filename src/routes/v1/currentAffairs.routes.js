const router = require("express").Router();
const currentAffairs = require("../../controllers/currentAffairs.controller");

router.post("/", currentAffairs.create);
router.put("/:id", currentAffairs.update);
router.delete("/:id", currentAffairs.remove);

router.get("/", currentAffairs.list);

module.exports = router;
