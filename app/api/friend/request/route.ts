import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { getCorsOrigin } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json(
      { error: "Unauthorized" },
      {
        status: 401,
        headers: {
          "Access-Control-Allow-Origin": getCorsOrigin(req),
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
      "Access-Control-Allow-Origin": getCorsOrigin(req),
    },
  });
}

export async function OPTIONS(req: NextRequest) {
  return new Response("OK", {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": getCorsOrigin(req),
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Credentials": "true",
    },
  });
}
