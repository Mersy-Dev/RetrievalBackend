import express from 'express';
import {
  loginAdmin,
  logoutAdmin,
  refreshToken,
  registerAdmin,
  verifyEmail,
  requestPasswordReset,
  resetPassword,
  getProfile,
} from '../controllers/adminController';

import { authLimiter, verifyAdminToken } from '../middlewares/authMiddleware';

const router = express.Router();

// Auth Routes
router.post("/register", authLimiter, registerAdmin);
router.post("/login", authLimiter, loginAdmin);
router.post("/logout", logoutAdmin);
router.get("/refresh-token", refreshToken);
router.get("/profile", verifyAdminToken, getProfile)
// Email Verification
router.get("/verify-email/:token", verifyEmail);

// Password Reset
router.post("/request-password-reset", authLimiter, requestPasswordReset);
router.post("/reset-password/:token", resetPassword);

export default router;
