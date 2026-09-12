import { getCurrentUser } from "./auth";
import { prisma } from "./prisma";

export async function getOperator() {
  const user = await getCurrentUser();
  if (!user || user.role !== "OPERATOR") throw new Error("OPERATOR_REQUIRED");
  return user;
}

export async function getOperatorProfile(userId: string) { return prisma.operatorProfile.findUnique({ where: { userId } }); }
