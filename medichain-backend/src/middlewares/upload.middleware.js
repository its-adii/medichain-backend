import multer from "multer";
import ImageKit from "imagekit";
import config from "../config/config.js";
import fs from "fs";
import path from "path";

const imagekit = new ImageKit({
  publicKey: config.IMAGEKIT_PUBLIC_KEY,
  privateKey: config.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: config.IMAGEKIT_URL_ENDPOINT,
});

const storage = multer.memoryStorage();

export const upload = multer({ storage });

export async function uploadToImageKit(file, req = null) {
  try {
    const response = await imagekit.upload({
      file: file.buffer,
      fileName: file.originalname,
      folder: "/medichain",
    });

    return response.url;
  } catch (error) {
    console.error("ImageKit upload failed, falling back to local storage:", error.message);

    try {
      const uploadsDir = path.join(process.cwd(), "uploads");
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const ext = path.extname(file.originalname) || ".jpg";
      const filename = `profile-${uniqueSuffix}${ext}`;
      const filePath = path.join(uploadsDir, filename);

      fs.writeFileSync(filePath, file.buffer);

      let baseUrl = "http://localhost:3000";
      if (req) {
        baseUrl = `${req.protocol}://${req.get("host")}`;
      }
      return `${baseUrl}/uploads/${filename}`;
    } catch (fsError) {
      console.error("Failed to save file locally:", fsError.message);
      throw error; // throw original ImageKit error if local fallback also fails
    }
  }
}
