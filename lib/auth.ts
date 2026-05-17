import { verifyToken } from "@clerk/backend";

export async function getUserId(req: Request) {
  const authHeader = req.headers.get("authorization");

  if (!authHeader) {
    throw new Error("Missing Authorization header");
  }

  const token = authHeader.replace("Bearer ", "");

  const payload = await verifyToken(token, {
    secretKey: process.env.CLERK_SECRET_KEY!,
  });

  return payload.sub;
}
