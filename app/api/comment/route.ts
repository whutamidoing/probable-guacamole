import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    console.log("Body received:", body);
    let { content, postId, commenterId } = body;

    if (!content || !postId || !userId) {
      console.log("Missing fields!");
      return NextResponse.json(
        { error: "Missing required fields!" },
        { status: 400 },
      );
    }

    const comment = await prisma.comment.create({
      data: { commenterId, content, postId },
    });

    return NextResponse.json(comment);
  } catch (error) {
    console.error("POST /api/posts error:", error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 },
    );
  }
}

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const postId = Number(searchParams.get("postId"));

  const comments = await prisma.comment.findMany({
    where: { postId: postId || undefined },
    include: { commenter: true },
  });

  const commentsWithLikes = await Promise.all(
    comments.map(async (comment) => {
      const likesCount = await prisma.commentLike.count({
        where: { commentId: comment.id },
      });

      const isLiked = await prisma.commentLike.findUnique({
        where: {
          commentId_likerId: {
            commentId: comment.id,
            likerId: userId,
          },
        },
      });

      return {
        ...comment,
        likesCount,
        isLiked: !!isLiked,
      };
    }),
  );

  return NextResponse.json(commentsWithLikes);
}
