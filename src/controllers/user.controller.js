const userService = require("../services/user.service");
const asyncHandler = require("../middlewares/asyncHandler.middleware");
const { successResponse } = require("../utils/response");

exports.create = asyncHandler(async (req, res) => {
  const result = await userService.createUser(req.body);
  return successResponse(res, result, "User created", 201);
});

exports.getOne = asyncHandler(async (req, res) => {
  const user = await userService.getUserById(req.params.id);
  return successResponse(res, user);
});

exports.list = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;
  const result = await userService.getUsersList(page, limit);

  return res.status(200).json({
    success: true,
    message: 'Users list',
    ...result
  });
});

exports.update = asyncHandler(async (req, res) => {
  await userService.updateUser(req.params.id, req.body);
  return successResponse(res, null, "User updated");
});

exports.remove = asyncHandler(async (req, res) => {
  await userService.deleteUser(req.params.id);
  return successResponse(res, null, "User deleted");
});
