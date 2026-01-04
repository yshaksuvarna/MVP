const router = require("express").Router();
const userController = require("../../controllers/user.controller");
const auth = require("../../middlewares/auth.middleware");

// router.use(auth);

router.post("/", userController.create);
router.get("/", userController.list);
router.get("/:id", userController.getOne);
router.put("/:id", userController.update);
router.delete("/:id", userController.remove);

module.exports = router;
