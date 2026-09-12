import { createHash, randomInt } from "node:crypto";
import { OtpChannel } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export function normalizePhone(value: string) {
  const digits = value.replace(/\D/g, "");
  const normalized = digits.startsWith("0") ? `254${digits.slice(1)}` : digits;
  if (!/^254[17]\d{8}$/.test(normalized)) throw new Error("Use a valid Kenyan phone number, for example 0712345678.");
  return normalized;
}

function hashCode(code: string) { return createHash("sha256").update(code).digest("hex"); }
function newCode() { return String(randomInt(100000, 1000000)); }
export function isOtpDevelopmentMode() { return process.env.NODE_ENV === "development" && process.env.OTP_DEV_MODE === "true"; }
export function isOtpDeliveryConfigured() { return Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM && process.env.AT_API_KEY && process.env.AT_USERNAME); }

async function deliver(channel: OtpChannel, recipient: string, code: string) {
  if (channel === "EMAIL") { await sendEmail(recipient, "Your TourLink verification code", `<p>Your TourLink verification code is <strong>${code}</strong>.</p><p>It expires in 10 minutes.</p>`); return; }
  await sendSms(recipient, `Your TourLink verification code is ${code}. It expires in 10 minutes.`);
}

async function sendSms(recipient: string, message: string) {
  if (process.env.AT_API_KEY && process.env.AT_USERNAME) {
    const body = new URLSearchParams({ username: process.env.AT_USERNAME, to: recipient, message });
    if (process.env.AT_SENDER_ID) body.set("from", process.env.AT_SENDER_ID);
    const response = await fetch("https://api.africastalking.com/version1/messaging", { method: "POST", headers: { apiKey: process.env.AT_API_KEY, Accept: "application/json", "Content-Type": "application/x-www-form-urlencoded" }, body });
    if (!response.ok) throw new Error("SMS delivery failed.");
    return;
  }
  if (!isOtpDevelopmentMode()) throw new Error("SMS delivery is not configured.");
  console.info(`[TourLink SMS] ${recipient}: ${message}`);
}

async function sendEmail(to: string, subject: string, html: string) {
  if (process.env.RESEND_API_KEY && process.env.EMAIL_FROM) {
    const response = await fetch("https://api.resend.com/emails", { method: "POST", headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" }, body: JSON.stringify({ from: process.env.EMAIL_FROM, to, subject, html }) });
    if (!response.ok) throw new Error("Email delivery failed.");
    return;
  }
  if (!isOtpDevelopmentMode()) throw new Error("Email delivery is not configured.");
  console.info(`[TourLink email] ${to} | ${subject} | ${html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()}`);
}

export async function sendAccountApprovalMessage(input: { email: string; phone: string | null; name: string; approved: boolean; note?: string | null }) {
  const status = input.approved ? "approved" : "not approved";
  const note = input.note ? `<p>Admin note: ${input.note}</p>` : "";
  const emailMessage = `<p>Hello ${input.name},</p><p>Your TourLink account has been <strong>${status}</strong> by our team.</p>${note}${input.approved ? "<p>You can now sign in and use TourLink.</p>" : "<p>Please contact support if you need help.</p>"}`;
  const smsMessage = `Hello ${input.name}, your TourLink account was ${status}.${input.note ? ` Admin note: ${input.note}` : ""} ${input.approved ? "You can now sign in." : "Please contact support if you need help."}`;
  await Promise.all([
    sendEmail(input.email, `Your TourLink account was ${status}`, emailMessage),
    input.phone ? sendSms(input.phone, smsMessage) : Promise.resolve()
  ]);
}

export async function issueOtp(userId: string, channel: OtpChannel, recipient: string) {
  const code = newCode();
  await prisma.otpChallenge.deleteMany({ where: { userId, channel, consumedAt: null } });
  await prisma.otpChallenge.create({ data: { userId, channel, codeHash: hashCode(code), expiresAt: new Date(Date.now() + 10 * 60 * 1000) } });
  await deliver(channel, recipient, code);
  return isOtpDevelopmentMode() ? code : undefined;
}

export async function sendAccountCreatedMessage(input: { name: string; email: string; phone: string }) {
  await Promise.all([
    sendEmail(input.email, "Welcome to TourLink", `<p>Hello ${input.name},</p><p>Thank you for creating an account with TourLink. We are happy to have you with us.</p><p>Complete your email and phone verification to start exploring trusted journeys.</p>`),
    sendSms(input.phone, `Hello ${input.name}, thank you for creating an account with TourLink. Complete verification to start exploring trusted journeys.`)
  ]);
}

export async function verificationState(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { emailVerifiedAt: true, phoneVerifiedAt: true } });
  return { emailVerified: Boolean(user?.emailVerifiedAt), phoneVerified: Boolean(user?.phoneVerifiedAt) };
}
