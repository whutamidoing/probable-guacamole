import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

const ALLOWED_ORIGIN = "http://localhost:3000";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { userId } = await auth();
  const { id } = await params;
  const postId = Number(id);
  const body = await req.json();
  console.log("Body received:", body);
  const { type } = body;

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

  const existing = await prisma.postLike.findUnique({
    where: {
      postId_likerId: {
        postId,
        likerId: userId,
      },
    },
  });

  if (existing) {
    await prisma.postLike.delete({
      where: {
        postId_likerId: {
          postId,
          likerId: userId,
        },
      },
    });

    return NextResponse.json(
      { liked: false },
      {
        headers: {
          "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
        },
      },
    );
  }

  await prisma.postLike.create({
    data: {
      postId,
      likerId: userId,
      type,
    },
  });

  return NextResponse.json(
    { liked: true },
    {
      headers: {
        "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
      },
    },
  );
}

export async function OPTIONS() {
  return new Response("OK", {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Credentials": "true",
    },
  });
}
