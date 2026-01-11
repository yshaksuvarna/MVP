const router = require("express").Router();
const topperController = require("../../controllers/toppers.controller");
const { createUploader } = require("../../middlewares");
const validate = require("../../middlewares/validate.middleware");
const { topperValidator } = require("../../validators/toppers.validator");

const uploadTopperImage = createUploader({
  folder: "toppers",
  fieldName: "image",
  maxSizeMB: 5,
});

router.post("/", uploadTopperImage, topperValidator, validate, topperController.create);
router.get("/", topperController.list);
router.get("/:id", topperController.getOne);
router.put("/:id", uploadTopperImage, topperValidator, validate, topperController.update);
router.delete("/:id", topperController.remove);

module.exports = router;
