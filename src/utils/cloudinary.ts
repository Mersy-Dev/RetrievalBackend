import { v2 as cloudinary } from "cloudinary";
import { Request } from "express";
import { UploadedFile } from "express-fileupload";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export const uploadToCloudinary = async (file: UploadedFile) => {
  return await cloudinary.uploader.upload(file.tempFilePath, {
    resource_type: "auto", // auto-detect file type
    folder: "documents",
  });
};
