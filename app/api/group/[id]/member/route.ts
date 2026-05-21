import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

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
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

    return NextResponse.json({ followed: false });
  }

  await prisma.groupMember.create({
    data: {
      groupId,
      memberId: userId,
      role,
    },
  });

  return NextResponse.json({ followed: true });
}
