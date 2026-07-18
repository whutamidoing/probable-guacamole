import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { getCorsOrigin } from "@/lib/db";
import { Message } from "@prisma/client";
import { createMessage } from "@/lib/conversation";

export async function POST(req: NextRequest) {
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

  const body = await req.json();

  console.log("Body received:", body);
  const { content, conversationId, senderId } = body;

  if (!content || !conversationId || !senderId) {
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

  const message = await createMessage(content, senderId, conversationId);

  return NextResponse.json(message, {
    headers: {
      "Access-Control-Allow-Origin": getCorsOrigin(req),
    },
  });
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

  const messages = await prisma.message.findMany({
    where: {
      conversationId: conversationId ? Number(conversationId) : undefined,
    },
    include: {
      sender: {
        select: { userName: true, profileImg: true },
      },
    },
  });

  const tree = buildTree(messages);
  console.log("GET /api/messages response:", tree);

  return NextResponse.json(tree, {
    headers: {
      "Access-Control-Allow-Origin": getCorsOrigin(req),
    },
  });
}

export async function PATCH(req: NextRequest) {}

export async function DELETE(req: NextRequest) {}

export async function OPTIONS(req: NextRequest) {
  return new Response("OK", {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": getCorsOrigin(req),
      "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Credentials": "true",
    },
  });
}

function buildTree(messages: Message[]) {
  const map = new Map();

  messages.forEach((c) => {
    map.set(c.id, {
      ...c,
      replies: [],
    });
  });

  const roots: Comment[] = [];

  messages.forEach((c) => {
    const node = map.get(c.id);

    if (c.parentId) {
      map.get(c.parentId)?.replies.push(node);
    } else {
      roots.push(node);
    }
  });

  return roots;
}
