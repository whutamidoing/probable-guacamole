import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";

const ALLOWED_ORIGIN = "http://localhost:3000";

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json(
      { error: "Unauthorized" },
      {
        status: 401,
        headers: {
          "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
        },
      },
    );
  }

  const friends = await prisma.friend.findMany({
    where: {
      receiverId: userId,
      status: "PENDING",
    },

    include: {
      user: {
        select: {
          id: true,
          userName: true,
          profileImg: true,
        },
      },
    },
  });

  const result = friends.map((friend) => ({
    id: friend.id,
    status: friend.status,
    otherUser: friend.user,
  }));

  return NextResponse.json(result, {
    headers: {
      "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
    },
  });
}

export async function OPTIONS() {
  return new Response("OK", {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Credentials": "true",
    },
  });
}
