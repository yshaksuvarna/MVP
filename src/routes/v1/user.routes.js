const router = require("express").Router();
const userController = require("../../controllers/user.controller");
const auth = require("../../middlewares/auth.middleware");
const validate = require("../../middlewares/validate.middleware");
const { createUserValidator, updateUserValidator } = require("../../validators/user.validator");

// router.use(auth);

router.post("/", createUserValidator, validate, userController.create);
router.get("/", userController.list);
router.get("/:id", userController.getOne);
router.put("/:id", updateUserValidator, validate, userController.update);
router.delete("/:id", userController.remove);

module.exports = router;
