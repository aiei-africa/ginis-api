import { Router } from "express";
import { prisma } from "../lib/prisma";
import { hashPassword, verifyPassword, signAccessToken, signRefreshToken } from "../lib/auth";
import { generateOtp, sendOtpSms } from "../lib/otp";

const router = Router();

router.post("/register", async (req, res, next) => {
  try {
    const { email, phone, password, firstName, lastName, dateOfBirth, gender, region } = req.body;

    if (!email || !phone || !password || !firstName || !lastName || !dateOfBirth || !gender || !region) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const existing = await prisma.user.findFirst({ where: { OR: [{ email }, { phone }] } });
    if (existing) {
      return res.status(409).json({ error: "Email or phone already registered" });
    }

    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        email, phone, passwordHash, firstName, lastName,
        dateOfBirth: new Date(dateOfBirth), gender, region,
      },
    });

    const code = generateOtp();
    await prisma.otpCode.create({
      data: {
        userId: user.id,
        code,
        purpose: "phone_verification",
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      },
    });
    await sendOtpSms(phone, code);

    res.status(201).json({ message: "Registered. OTP sent to phone.", userId: user.id });
  } catch (err) {
    next(err);
  }
});

router.post("/verify-otp", async (req, res, next) => {
  try {
    const { userId, code } = req.body;
    const otp = await prisma.otpCode.findFirst({
      where: { userId: Number(userId), code, purpose: "phone_verification", consumedAt: null },
      orderBy: { createdAt: "desc" },
    });
    if (!otp || otp.expiresAt < new Date()) {
      return res.status(400).json({ error: "Invalid or expired OTP" });
    }
    await prisma.otpCode.update({ where: { id: otp.id }, data: { consumedAt: new Date() } });
    await prisma.user.update({ where: { id: Number(userId) }, data: { phoneVerifiedAt: new Date() } });
    res.json({ message: "Phone verified" });
  } catch (err) {
    next(err);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    if (!user.phoneVerifiedAt) {
      return res.status(403).json({ error: "Phone not verified" });
    }
    const accessToken = signAccessToken({ userId: user.id });
    const refreshToken = signRefreshToken({ userId: user.id });
    res.json({ accessToken, refreshToken });
  } catch (err) {
    next(err);
  }
});

export default router;
