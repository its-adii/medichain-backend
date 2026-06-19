import multer from "multer";
import ImageKit from "imagekit";
import config from "../config/config.js";

const imagekit = new ImageKit({
  publicKey: config.IMAGEKIT_PUBLIC_KEY,
  privateKey: config.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: config.IMAGEKIT_URL_ENDPOINT,
});

const storage = multer.memoryStorage();

export const upload = multer({ storage });

export async function uploadToImageKit(file) {
  const response = await imagekit.upload({
    file: file.buffer,
    fileName: file.originalname,
    folder: "/medichain",
  });

  return response.url;
}
