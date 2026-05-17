import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserId } from "@/lib/auth";

export async function POST(
  req: NextRequest,
  { params }: { params: { postId: string } },
) {
  const postId = Number(params.postId);
  const userId = await getUserId(req);
  const body = await req.json();
  console.log("Body received:", body);
  const { type } = body;

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

    return NextResponse.json({ liked: false });
  }

  await prisma.postLike.create({
    data: {
      postId,
      likerId: userId,
      type,
    },
  });

  return NextResponse.json({ liked: true });
}
