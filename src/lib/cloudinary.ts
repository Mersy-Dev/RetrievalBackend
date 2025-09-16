import { v2 as cloudinary } from "cloudinary";
import { UploadedFile } from "express-fileupload";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export const uploadToCloudinary = async (file: UploadedFile) => {
  const result = await cloudinary.uploader.upload(file.tempFilePath, {
    resource_type: "raw",
    folder: "documents",
  });

  // Generate inline preview URL
  const pdfUrl = cloudinary.url(result.public_id, {
    resource_type: "raw",
    type: "upload",
    flags: "inline",
  });

  return { ...result, pdfUrl };
};

// Function to delete a file from Cloudinary using its public ID
export const deleteFromCloudinary = async (publicId: string) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: "raw",
    });
    return result;
  } catch (error) {
    throw new Error("Failed to delete file from Cloudinary");
  } 
};