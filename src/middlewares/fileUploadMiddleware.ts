// import multer, { FileFilterCallback } from 'multer';
// import { NextFunction, Request, Response } from 'express';
// import cloudinary from './../lib/cloudinary';
// // import { ExtendedRequest } from '../types/ExtendedRequest';

// // Store files in memory (for Cloudinary upload)
// const storage = multer.memoryStorage();

// // Strictly allow only document MIME types
// const documentMimeTypes = [
//   'application/pdf',
//   'application/msword', // .doc
//   'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
//   'application/vnd.ms-excel', // .xls
//   'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
//   'application/vnd.ms-powerpoint', // .ppt
//   'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx
//   'text/plain', // .txt
//   'application/zip',
//   'application/x-zip-compressed',
// ];

// const fileFilter = (
//   req: Request,
//   file: Express.Multer.File,
//   cb: FileFilterCallback
// ): void => {
//   if (documentMimeTypes.includes(file.mimetype)) {
//     cb(null, true); // ✅ Allowed
//   } else {
//     cb(new Error('❌ Only document files are allowed.'));
//   }
// };

// // Multer config
// export const upload = multer({
//   storage,
//   fileFilter,
//   limits: {
//     fileSize: 10 * 1024 * 1024, // 10MB
//   },
// });

// // Accept single or multiple files — modify as needed
// export const anyUpload = upload.any();

// export const uploadToCloudinary = (
//   req: ExtendedRequest,
//   res: Response,
//   next: NextFunction
// ) => {
//   const uploadPromises: Promise<void>[] = [];

//   const getFolder = (fieldname: string): string => {
//     const userId = req.user?.id || 'anonymous';
//     const folderNameFromBody =
//       typeof req.body === 'object' ? req.body?.folderName : undefined;
//     const folderName = folderNameFromBody || fieldname;
//     return `${userId}/${folderName}`;
//   };

//   const handleUpload = (file: Express.Multer.File) => {
//     const folder = getFolder(file.fieldname);

//     return new Promise<void>((resolve, reject) => {
//       cloudinary.uploader
//         .upload_stream(
//           {
//             folder,
//             resource_type: 'raw', // 👈 Always use 'raw' for documents
//           },
//           (error, result) => {
//             if (error) return reject(error);

//             if (!req.fileUrls) req.fileUrls = {};
//             if (!req.fileUrls[file.fieldname]) req.fileUrls[file.fieldname] = [];

//             if (!req.cloudinaryData) req.cloudinaryData = {};
//             if (!req.cloudinaryData[file.fieldname]) req.cloudinaryData[file.fieldname] = [];

//             req.fileUrls[file.fieldname].push(result?.secure_url || '');
//             req.cloudinaryData[file.fieldname].push({
//               url: result?.secure_url || '',
//               public_id: result?.public_id || '',
//             });
//             resolve();
//           }
//         )
//         .end(file.buffer);
//     });
//   };

//   if (Array.isArray(req.files)) {
//     req.files.forEach((file) => uploadPromises.push(handleUpload(file)));
//   } else if (req.file) {
//     uploadPromises.push(handleUpload(req.file));
//   } else {
//     console.warn('🫥 No files to upload');
//     return next();
//   }

//   Promise.all(uploadPromises)
//     .then(() => next())
//     .catch((err) => {
//       console.error('❌ Upload error:', err);
//       next(err);
//     });
// };
