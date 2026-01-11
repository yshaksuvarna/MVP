const locationService = require("../services/location.service");
const asyncHandler = require("../middlewares/asyncHandler.middleware");
const { successResponse } = require("../utils/response");

exports.create = asyncHandler(async (req, res) => {
  const imagePath = req.file ? req.file.filename : null; // Consistent with other modules: filename, not full path

  const result = await locationService.createLocation({
    ...req.body,
    image: imagePath
  });

  return successResponse(res, result, "Location created", 201);
});

exports.getOne = asyncHandler(async (req, res) => {
  const location = await locationService.getLocationById(req.params.id);
  return successResponse(res, location);
});

exports.list = asyncHandler(async (req, res) => {
  const result = await locationService.getLocationsList(req.query);

  return res.status(200).json({
    success: true,
    message: result.data.length ? "Locations list" : "No locations found",
    ...result
  });
});

exports.update = asyncHandler(async (req, res) => {
  // Note: Previous impl used /uploads/locations/filename for update, but filename for create.
  // Standardizing to just filename if that's what's stored.
  // Checking previous create: `const imagePath = req.file ? req.file.filename : null;`
  // Checking previous update: `const imagePath = req.file ? ` /uploads/locations/${req.file.filename}` : null;`
  // Wait, the create impl stored just filename. The update stored full path?
  // Let's verify what `imagePath` in create was doing.
  // create: `const imagePath = req.file ? req.file.filename : null;`
  // update: `const imagePath = req.file ? `/uploads/locations/${req.file.filename}` : null;`
  // This looks inconsistent in the original code. I will standardize to filename.

  const image = req.file ? req.file.filename : undefined;

  await locationService.updateLocation(req.params.id, {
    ...req.body,
    image
  });

  return successResponse(res, null, "Location updated");
});

exports.remove = asyncHandler(async (req, res) => {
  await locationService.deleteLocation(req.params.id);
  return successResponse(res, null, "Location deleted");
});

exports.locationSlider = asyncHandler(async (req, res) => {
  const result = await locationService.getLocationSlider(req.query);

  if (!result.data && result.data !== undefined) {
    // Logic check: service returns object with or without data?
    // Service returns data object OR throws? No, returns { data: null... } if empty.
    // Wait, logic in service: `if (!rows.length) return { data: null... }`
    if (result.data === null) {
      return successResponse(res, result, "No more locations");
    }
  }

  return successResponse(res, result, "Location fetched");
});

