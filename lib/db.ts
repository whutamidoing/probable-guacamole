import { NextRequest } from "next/server";
import { getPrisma } from "./prisma";

export const prisma = getPrisma();

const allowedOrigins = [
  "http://localhost:3000",
  process.env.NEXT_PUBLIC_APP_URL,
];

export function getCorsOrigin(req: NextRequest) {
  return req.headers.get("origin") ?? "http://localhost:3000";
}
