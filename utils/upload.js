import multer from "multer";
import { GridFsStorage } from "multer-gridfs-storage";
import dotenv from "dotenv";
dotenv.config();

const storage = new GridFsStorage({
  url: process.env.DB_URL,
  options: { useNewUrlParser: true, useUnifiedTopology: true },
  file: (req, file) => {
    const match = ["image/png", "image/jpeg"]; // Corrected MIME types

    if (match.indexOf(file.mimetype) === -1) {
      // Invalid file type
      const filename = `${Date.now()}-blog-${file.originalname}`;
      return filename;
    }

    return {
      bucketName: "photos",
      filename: `${Date.now()}-blog-${file.originalname}`,
    };
  },
});

// Handle file size limitation if needed
const upload = multer({
  storage,
  limits: {
    fileSize: 1024 * 1024 * 5, // Example: limit file size to 5MB
  },
});

export default upload;
