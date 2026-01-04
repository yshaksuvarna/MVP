module.exports = {
  authMiddleware: require("./auth.middleware"),
  payloadCheck: require("./payloadCheck.middleware"),
  asyncHandler: require("./asyncHandler.middleware"),
  createUploader: require("./upload.middleware")
};