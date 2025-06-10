import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  service: "Gmail", // Or "Outlook", "Yahoo", or use custom SMTP config
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendEmail = async (to: string, subject: string, html: string) => {
  try {
    await transporter.sendMail({
      from: `"Your App Name" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
  } catch (err) {
    console.error("Email sending error:", err);
    throw new Error("Failed to send email");
  }
};
