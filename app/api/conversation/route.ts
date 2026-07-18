import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { getCorsOrigin } from "@/lib/db";
import { Conversation } from "@prisma/client";
import { findOrCreateConversation } from "@/lib/conversation";

export async function POST(req: NextRequest) {
  try {
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

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    const body = await req.json();
    console.log("Body received:", body);
    const { participants, message } = body;

    if (!participants) {
      console.log("Missing fields!");
      return NextResponse.json(
        { error: "Missing required fields!" },
        {
          status: 400,
          headers: {
            "Access-Control-Allow-Origin": getCorsOrigin(req),
          },
        },
      );
    }

    const conversation = await findOrCreateConversation(
      participants,
      message,
      userId,
    );

    return NextResponse.json(conversation, {
      headers: {
        "Access-Control-Allow-Origin": getCorsOrigin(req),
      },
    });
  } catch (error) {
    console.error("CONVO /api/conversation error:", error);
    return NextResponse.json(
      { error: (error as Error).message },
      {
        status: 500,
        headers: {
          "Access-Control-Allow-Origin": getCorsOrigin(req),
        },
      },
    );
  }
}

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
  const participantId = searchParams.get("participantId");

  let conversations;
  if (participantId) {
    conversations = await prisma.conversation.findMany({
      where: { participants: { some: { participantId: userId ?? undefined } } },
      include: {
        participants: {
          where: {
            participantId,
          },
        },
      },
    });
  } else {
    conversations = await prisma.conversation.findMany({
      include: {
        participants: {
          include: {
            participant: true,
          },
        },
        messages: {
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
        },
      },
    });
  }

  const result = conversations;

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
