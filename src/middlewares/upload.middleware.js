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
      const uploadPath = path.join("uploads");

      // ✅ Create base uploads folder if it doesn't exist
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }

      // ✅ Create subfolder if it doesn't exist
      const subPath = path.join(uploadPath, folder);
      if (!fs.existsSync(subPath)) {
        fs.mkdirSync(subPath, { recursive: true });
      }

      cb(null, uploadPath);
    },

    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      const timestamp = Date.now();
      const random = Math.round(Math.random() * 1e6);

      const filename = `${folder}_${timestamp}_${random}${ext}`;

      // Prepend folder to filename so it's stored as "folder/filename" in DB
      cb(null, `${folder}/${filename}`);
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