const router = require("express").Router();
const bannerController = require("../../controllers/banners.controller");
const { createUploader } = require("../../middlewares");

const uploadBannerImage = createUploader({
    folder: "banners",
    fieldName: "image",
    maxSizeMB: 5,
});

router.post("/", uploadBannerImage, bannerController.create);
router.get("/", bannerController.list);
router.get("/:id", bannerController.getOne);
router.put("/:id", uploadBannerImage, bannerController.update);
router.delete("/:id", bannerController.remove);

module.exports = router;
