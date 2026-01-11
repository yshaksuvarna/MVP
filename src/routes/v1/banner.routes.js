const router = require("express").Router();
const bannerController = require("../../controllers/banners.controller");
const { createUploader } = require("../../middlewares");
const validate = require("../../middlewares/validate.middleware");
const { bannerValidator } = require("../../validators/banners.validator");

const uploadBannerImage = createUploader({
    folder: "banners",
    fieldName: "image",
    maxSizeMB: 5,
});

router.post("/", uploadBannerImage, bannerValidator, validate, bannerController.create);
router.get("/", bannerController.list);
router.get("/:id", bannerController.getOne);
router.put("/:id", uploadBannerImage, bannerValidator, validate, bannerController.update);
router.delete("/:id", bannerController.remove);

module.exports = router;
