import { NextResponse, NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { getCorsOrigin } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
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

  const { id } = await params;
  const numId = Number(id);

  const [comment, likesCount, likeRecord] = await Promise.all([
    prisma.comment.findUnique({
      where: { id: numId },
      include: { commenter: true },
    }),

    prisma.commentLike.count({
      where: { commentId: numId },
    }),

    prisma.commentLike.findUnique({
      where: {
        commentId_likerId: {
          commentId: numId,
          likerId: userId,
        },
      },
    }),
  ]);

  if (!comment) {
    return NextResponse.json(
      { error: "Comment not found" },
      {
        status: 404,
        headers: {
          "Access-Control-Allow-Origin": getCorsOrigin(req),
        },
      },
    );
  }

  return NextResponse.json(
    { ...comment, likesCount, isLiked: !!likeRecord },
    {
      headers: {
        "Access-Control-Allow-Origin": getCorsOrigin(req),
      },
    },
  );
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
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

    const body = await req.json();
    console.log("Body received:", body);
    let { content } = body;

    if (!content) {
      console.error("No change to add");
      return NextResponse.json(
        { error: "No change to add" },
        {
          status: 400,
          headers: {
            "Access-Control-Allow-Origin": getCorsOrigin(req),
          },
        },
      );
    }

    const { id } = await params;
    const numId = Number(id);

    const comment = await prisma.comment.update({
      where: { id: numId },
      data: { content },
    });

    if (!comment) {
      return NextResponse.json(
        { error: "User not found" },
        {
          status: 404,
          headers: {
            "Access-Control-Allow-Origin": getCorsOrigin(req),
          },
        },
      );
    }

    return NextResponse.json(comment);
  } catch (error) {
    console.error("COMMENT /api/comment/[id] error:", error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
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

    const { id } = await params;

    const post = await prisma.user.delete({
      where: { id },
    });

    if (!post) {
      return NextResponse.json(
        { error: "Post not found" },
        {
          status: 404,
          headers: {
            "Access-Control-Allow-Origin": getCorsOrigin(req),
          },
        },
      );
    }
  } catch (error) {
    console.error("POST /api/post/[id] error:", error);
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

export async function OPTIONS(req: NextRequest) {
  return new Response("OK", {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": getCorsOrigin(req),
      "Access-Control-Allow-Methods": "GET, POST, DELETE, PATCH, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Credentials": "true",
    },
  });
}
