import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { userId } = await auth();
  const { id } = await params;
  const commentId = Number(id);
  const body = await req.json();
  console.log("Body received:", body);
  const { type } = body;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const existing = await prisma.commentLike.findUnique({
    where: {
      commentId_likerId: {
        commentId,
        likerId: userId,
      },
    },
  });

  if (existing) {
    await prisma.commentLike.delete({
      where: {
        commentId_likerId: {
          commentId,
          likerId: userId,
        },
      },
    });

    return NextResponse.json({ liked: false });
  }

  await prisma.commentLike.create({
    data: {
      commentId,
      likerId: userId,
      type,
    },
  });

  return NextResponse.json({ liked: true });
}
