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
          "Access-Control-Allow-Origin": getCorsOrigin(req),
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
          "Access-Control-Allow-Origin": getCorsOrigin(req),
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
  const groupId = searchParams.get("groupId");

  const members = await prisma.groupMember.findMany({
    where: { groupId: groupId ? Number(groupId) : undefined },
  });

  return NextResponse.json(members, {
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
