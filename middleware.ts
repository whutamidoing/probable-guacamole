import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware(async (auth, req) => {
  console.log("MIDDLEWARE HIT", req.method, req.nextUrl.pathname);
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "http://localhost:3000",
        "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }
});
