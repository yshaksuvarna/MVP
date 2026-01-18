const router = require("express").Router();
const quizController = require("../../controllers/quiz.controller");
const validate = require("../../middlewares/validate.middleware");
const { quizValidator } = require("../../validators/quiz.validator");

router.post("/", quizValidator, validate, quizController.create);
router.get("/", quizController.list);
router.get("/:id", quizController.getById);
router.put("/:id", quizValidator, validate, quizController.update);
router.delete("/:id", quizController.remove);

module.exports = router;
