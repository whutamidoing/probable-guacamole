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
  const groupId = Number(id);
  const body = await req.json();
  console.log("Body received:", body);
  const { role } = body;

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

  const existing = await prisma.groupMember.findUnique({
    where: {
      memberId_groupId: {
        groupId,
        memberId: userId,
      },
    },
  });

  if (existing) {
    await prisma.groupMember.delete({
      where: {
        memberId_groupId: {
          groupId,
          memberId: userId,
        },
      },
    });

    return NextResponse.json(
      { followed: false },
      {
        headers: {
          "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
        },
      },
    );
  }

  await prisma.groupMember.create({
    data: {
      groupId,
      memberId: userId,
      role,
    },
  });

  return NextResponse.json(
    { followed: true },
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
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Credentials": "true",
    },
  });
}
