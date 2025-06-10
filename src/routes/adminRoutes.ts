import express from 'express';
import {
  loginAdmin,
  logoutAdmin,
  refreshToken,
  registerAdmin,
  verifyEmail,
  requestPasswordReset,
  resetPassword,
} from '../controllers/adminController';

import { verifyAdminToken } from '../middlewares/authMiddleware';

const router = express.Router();

// Auth Routes
router.post("/register", registerAdmin);
router.post("/login", loginAdmin);
router.post("/logout", logoutAdmin);
router.get("/refresh-token", refreshToken);

// Email Verification
router.get("/verify-email/:token", verifyEmail);

// Password Reset
router.post("/request-password-reset", requestPasswordReset);
router.post("/reset-password/:token", resetPassword);

export default router;
