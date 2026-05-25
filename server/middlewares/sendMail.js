import { createTransport } from "nodemailer";

const sendMail = async (email, subject, data) => {
  // For development - log OTP to console
  console.log("\n" + "=".repeat(50));
  console.log("📧 OTP VERIFICATION");
  console.log("=".repeat(50));
  console.log(`Email: ${email}`);
  console.log(`OTP: ${data.otp}`);
  console.log("=".repeat(50) + "\n");
};

export default sendMail;

export const sendForgotMail = async (subject, data) => {
  // For development - log reset link to console
  console.log("\n" + "=".repeat(50));
  console.log("🔑 PASSWORD RESET REQUEST");
  console.log("=".repeat(50));
  console.log(`Email: ${data.email}`);
  console.log(`Reset Link: ${process.env.frontendurl}/reset-password/${data.token}`);
  console.log("=".repeat(50) + "\n");
};

