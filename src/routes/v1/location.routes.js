const router = require("express").Router();
const locationController = require("../../controllers/location.controller");
const { createUploader } = require("../../middlewares");
const auth = require("../../middlewares/auth.middleware");
const validate = require("../../middlewares/validate.middleware");
const { locationValidator } = require("../../validators/location.validator");

const uploadLocationImage = createUploader({
  folder: "locations",
  fieldName: "image",
  maxSizeMB: 5,
});

// router.use(auth);

router.get("/", locationController.list);
router.get("/slider", locationController.locationSlider);
router.post("/", uploadLocationImage, locationValidator, validate, locationController.create);
router.put("/:id", uploadLocationImage, locationValidator, validate, locationController.update);
router.delete("/:id", locationController.remove);

module.exports = router;
