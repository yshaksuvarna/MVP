const router = require("express").Router();
const articlesController = require("../../controllers/articles.controller");
const { createUploader } = require("../../middlewares");
const validate = require("../../middlewares/validate.middleware");
const { articleValidator } = require("../../validators/articles.validator");

const uploadArticleImage = createUploader({
    folder: "articles",
    fieldName: "image",
    maxSizeMB: 5,
});

router.post("/", uploadArticleImage, articleValidator, validate, articlesController.create);
router.get("/", articlesController.list);
router.get("/:id", articlesController.getById);
router.put("/:id", uploadArticleImage, articleValidator, validate, articlesController.update);
router.delete("/:id", articlesController.remove);

module.exports = router;
