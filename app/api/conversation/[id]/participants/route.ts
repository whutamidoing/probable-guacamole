import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { getCorsOrigin } from "@/lib/db";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { userId } = await auth();
  const { id } = await params;
  const conversationIdParam = Number(id);

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

  const body = await req.json();

  console.log("Body received:", body);
  const { participantId, conversationId } = body;

  if (conversationIdParam && !conversationId) {
    await prisma.conversationParticipant.create({
      data: {
        participantId,
        conversationId: Number(conversationIdParam),
      },
    });
  } else {
    await prisma.conversationParticipant.create({
      data: {
        participantId,
        conversationId,
      },
    });
  }

  return NextResponse.json(
    { followed: true },
    {
      headers: {
        "Access-Control-Allow-Origin": getCorsOrigin(req),
      },
    },
  );
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
  const conversationId = searchParams.get("conversationId");

  const participants = await prisma.conversationParticipant.findMany({
    where: {
      conversationId: conversationId ? Number(conversationId) : undefined,
    },
    include: {
      participant: {
        select: {
          userName: true,
          profileImg: true,
        },
      },
    },
  });

  return NextResponse.json(participants, {
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
