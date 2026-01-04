const multer = require("multer");
const path = require("path");
const fs = require("fs");
const ApiError = require("../utils/ApiError");

const createUploader = ({
  folder,
  allowedTypes = ["image/jpeg", "image/png", "image/webp"],
  maxSizeMB = 5,
  fieldName = "image",
}) => {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadPath = path.join("uploads", folder);

      // ✅ Create folder if it doesn't exist
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }

      cb(null, uploadPath);
    },

    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();

      const name = `${folder}_${Date.now()}_${Math.round(
        Math.random() * 1e6
      )}${ext}`;

      cb(null, name);
    },
  });

  const fileFilter = (req, file, cb) => {
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new ApiError("Invalid file type", 400));
    }
    cb(null, true);
  };

  return multer({
    storage,
    fileFilter,
    limits: {
      fileSize: maxSizeMB * 1024 * 1024,
    },
  }).single(fieldName);
};

module.exports = createUploader;