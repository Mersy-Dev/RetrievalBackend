import { v2 as cloudinary } from 'cloudinary';

/**
 * Deletes a document asset from Cloudinary using its public ID extracted from the full URL.
 * @param fileUrl - The full Cloudinary URL stored in the database.
 */
export const deleteCloudinaryAsset = async (
  fileUrl: string,
): Promise<void> => {
  if (!fileUrl) return;

  try {
    const parts = fileUrl.split('/');
    const uploadIndex = parts.findIndex((part) => part === 'upload');

    if (uploadIndex === -1) {
      throw new Error('Invalid Cloudinary URL. "upload" segment not found.');
    }

    const publicIdWithExtension = parts.slice(uploadIndex + 1).join('/');
    
    // Remove known document file extensions (expand as needed)
    const publicId = publicIdWithExtension.replace(
      /\.(pdf|docx?|xlsx?|pptx?|txt|zip)$/i,
      '',
    );

    // Force document delete with 'raw' resource type
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: 'raw',
    });

    if (result.result !== 'ok' && result.result !== 'not found') {
      throw new Error(`Failed to delete file: ${result.result}`);
    }

    console.log(`🗑️ Deleted Cloudinary document: ${publicId}`);
  } catch (error) {
    console.error('❌ Cloudinary delete error:', error);
    throw error;
  }
};

/**
 * Extracts the public ID from a full Cloudinary URL (documents only).
 * @param url - Cloudinary file URL
 * @returns publicId (without extension)
 */
export const extractPublicIdFromUrl = (url: string): string | null => {
  try {
    const parts = url.split('/');
    const uploadIndex = parts.findIndex((part) => part === 'upload');
    if (uploadIndex === -1) return null;

    const publicIdParts = parts.slice(uploadIndex + 1);
    const lastPart = publicIdParts.pop() || '';
    const withoutExtension = lastPart.split('.')[0];

    return [...publicIdParts, withoutExtension].join('/');
  } catch {
    return null;
  }
};
