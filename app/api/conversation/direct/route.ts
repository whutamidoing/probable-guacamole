import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { getCorsOrigin } from "@/lib/db";
import { Conversation } from "@prisma/client";

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

  const { searchParams } = new URL(req.url);
  const otherUserId = searchParams.get("otherUserId");

  if (!otherUserId) {
    return NextResponse.json(
      { error: "Missing otherUserId" },
      {
        status: 400,
        headers: {
          "Access-Control-Allow-Origin": getCorsOrigin(req),
        },
      },
    );
  }

  const conversation = await prisma.conversation.findFirst({
    where: {
      isGroup: false,
      participants: {
        every: {
          participantId: {
            in: [userId, otherUserId],
          },
        },
      },
    },
    include: {
      participants: true,
      messages: {
        orderBy: {
          createdAt: "desc",
        },
        take: 1,
      },
    },
  });

  const result = conversation;
  console.log("Returning DM: ", conversation);

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
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Credentials": "true",
    },
  });
}
