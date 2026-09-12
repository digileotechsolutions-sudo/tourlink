import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

const secret = new TextEncoder().encode(process.env.SESSION_SECRET || "tourlink-development-secret-change-me");
export const SESSION_COOKIE = "tourlink_session";

export async function hashPassword(password: string) { return bcrypt.hash(password, 12); }
export async function verifyPassword(password: string, hash: string) { return bcrypt.compare(password, hash); }

export async function createSession(user: { id: string; role: string; name: string; email: string }) {
  const token = await new SignJWT(user).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime("7d").sign(secret);
  (await cookies()).set(SESSION_COOKIE, token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 7 });
}

export async function getSession() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  try { return (await jwtVerify(token, secret)).payload as { id: string; role: string; name: string; email: string }; } catch { return null; }
}

export async function getCurrentUser() {
  const session = await getSession();
  if (!session?.id) return null;
  try { const user = await prisma.user.findUnique({ where: { id: session.id }, select: { id: true, name: true, email: true, role: true, avatarUrl: true, verificationLevel: true, emailVerifiedAt: true, phoneVerifiedAt: true, approvalStatus: true, accountStatus: true } }); if (!user?.emailVerifiedAt || !user.phoneVerifiedAt || user.approvalStatus !== "APPROVED" || user.accountStatus !== "ACTIVE") return null; return user; } catch { return null; }
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) throw new Error("UNAUTHORIZED");
  return user;
}
