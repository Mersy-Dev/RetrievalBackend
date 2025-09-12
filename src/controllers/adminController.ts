import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { PrismaClient } from "../generated/client";
import { sendEmail } from "../utils/mailer";

const prisma = new PrismaClient();

// Generate Access Token
const generateAccessToken = (adminId: number): string => {
  return jwt.sign({ adminId }, process.env.JWT_SECRET!, { expiresIn: "15m" });
};

// Generate Refresh Token
const generateRefreshToken = (adminId: number): string => {
  return jwt.sign({ adminId }, process.env.REFRESH_TOKEN_SECRET!, {
    expiresIn: "7d",
  });
};

// Register Admin
export const registerAdmin = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { name, email, password, confirmPassword } = req.body;

  try {
    if (!name || !email || !password || !confirmPassword) {
      res.status(400).json({ message: "All fields are required" });
      return;
    }

    if (password !== confirmPassword) {
      res.status(400).json({ message: "Passwords do not match" });
      return;
    }

    const existingAdmin = await prisma.admin.findUnique({ where: { email } });
    if (existingAdmin) {
      res.status(400).json({ message: "Admin with this email already exists" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = await prisma.admin.create({
      data: {
        name,
        email,
        password: hashedPassword,
        isEmailVerified: false,
      },
    });

    const verificationToken = jwt.sign(
      { adminId: newAdmin.id },
      process.env.JWT_SECRET!,
      { expiresIn: "1h" }
    );

    const verificationLink = `http://localhost:3000/verify-email/${verificationToken}`;

    await sendEmail(
      email,
      "Verify Your Email",
      `<p>Hello ${name},</p>
       <p>Thank you for registering. Please verify your email by clicking the link below:</p>
       <a href="${verificationLink}">${verificationLink}</a>
       <p>This link will expire in 1 hour.</p>`
    );

    const accessToken = generateAccessToken(newAdmin.id);
    const refreshToken = generateRefreshToken(newAdmin.id);

    await prisma.admin.update({
      where: { id: newAdmin.id },
      data: { refreshToken },
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(201).json({
      message: `Welcome, ${name}! 🎉 Your account has been created successfully. Please check your email to verify your account.`,
      accessToken,
      refreshToken,
      user: filterUserInfo(newAdmin),
    });
  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


export const verifyEmail = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { token } = req.params;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      adminId: number;
    };

    const admin = await prisma.admin.findUnique({
      where: { id: decoded.adminId },
    });

    if (!admin) {
      res.status(404).json({ message: "Admin not found" });
      return;
    }

    if (admin.isEmailVerified) {
      res.status(200).json({ message: "Email already verified" });
      return;
    }

    await prisma.admin.update({
      where: { id: admin.id },
      data: { isEmailVerified: true },
    });

    res.status(200).json({ message: "Email verified successfully" });
  } catch (err) {
    console.error("Email Verification Error:", err);
    res.status(400).json({ message: "Invalid or expired verification token" });
  }
};

export const loginAdmin = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { email, password } = req.body;

  try {
    const admin = await prisma.admin.findUnique({ where: { email } });
    if (!admin) {
      res.status(400).json({ message: "Invalid credentials" });
      return;
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      res.status(400).json({ message: "Invalid credentials" });
      return;
    }

    const accessToken = generateAccessToken(admin.id);
    const refreshToken = generateRefreshToken(admin.id);

    await prisma.admin.update({
      where: { id: admin.id },
      data: { refreshToken },
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).json({
      message: `Hey there! 😊 You're logged in successfully. ${
        admin.isEmailVerified
          ? "You’re all set and verified. Enjoy your day!"
          : "But we still need you to verify your email. Check your inbox!"
      }`,
      accessToken,
      refreshToken,
      user: filterUserInfo(admin),
    });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
// Refresh Token
export const refreshToken = async (
  req: Request,
  res: Response
): Promise<void> => {
  const token = req.cookies.refreshToken;

  if (!token) {
    res.status(401).json({ message: "No refresh token provided" });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET!) as {
      adminId: number;
    };

    const admin = await prisma.admin.findUnique({
      where: { id: decoded.adminId },
    });
    if (!admin || admin.refreshToken !== token) {
      res.status(403).json({ message: "Invalid refresh token" });
      return;
    }

    const newAccessToken = generateAccessToken(admin.id);
    const newRefreshToken = generateRefreshToken(admin.id);

    await prisma.admin.update({
      where: { id: admin.id },
      data: { refreshToken: newRefreshToken },
    });

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({ accessToken: newAccessToken });
  } catch (err) {
    console.error("Refresh Token Error:", err);
    res.status(403).json({ message: "Refresh token expired or invalid" });
  }
};

// Logout Admin
export const logoutAdmin = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Clear refresh token from cookie
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    // Optional: clear it from DB as well
    const token = req.cookies.refreshToken;
    if (token) {
      const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET!) as {
        adminId: number;
      };
      await prisma.admin.update({
        where: { id: decoded.adminId },
        data: { refreshToken: null },
      });
    }

    res.status(200).json({ message: "Logout successful" });
  } catch (err) {
    console.error("Logout Error:", err);
    res.status(500).json({ message: "Failed to logout" });
  }
};

export const requestPasswordReset = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { email } = req.body;

  try {
    const admin = await prisma.admin.findUnique({ where: { email } });

    if (!admin) {
      res.status(404).json({ message: "Admin not found" });
      return;
    }

    const resetToken = jwt.sign(
      { adminId: admin.id },
      process.env.JWT_SECRET!,
      { expiresIn: "15m" }
    );

    const resetLink = `http://localhost:3000/reset-password/${resetToken}`;

    await sendEmail(
      email,
      "Password Reset Request",
      `<p>Hello ${admin.name},</p>
   <p>You requested a password reset. Click the link below to reset your password:</p>
   <a href="${resetLink}">${resetLink}</a>
   <p>This link will expire in 15 minutes.</p>`
    );
    res.status(200).json({ message: "Password reset link sent" });
  } catch (err) {
    console.error("Request Reset Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const resetPassword = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { token } = req.params;
  const { newPassword } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      adminId: number;
    };

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.admin.update({
      where: { id: decoded.adminId },
      data: { password: hashedPassword },
    });

    res.status(200).json({ message: "Password reset successful" });
  } catch (err) {
    console.error("Reset Password Error:", err);
    res.status(403).json({ message: "Invalid or expired token" });
  }
};

function filterUserInfo(admin: {
  id: number;
  name: string;
  email: string;
  password: string;
  refreshToken: string | null;
  isEmailVerified: boolean;
  createdAt: Date;
}) {
  return {
    id: admin.id,
    name: admin.name,
    email: admin.email,
    isEmailVerified: admin.isEmailVerified,
    createdAt: admin.createdAt,
  };
}
