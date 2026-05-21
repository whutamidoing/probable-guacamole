import { NextResponse, NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const numId = Number(id);

  const [post, likesCount, likeRecord] = await Promise.all([
    prisma.post.findUnique({
      where: { id: numId },
      include: { author: true },
    }),

    prisma.postLike.count({
      where: { postId: numId },
    }),

    prisma.postLike.findUnique({
      where: {
        postId_likerId: {
          postId: numId,
          likerId: userId,
        },
      },
    }),
  ]);

  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  return NextResponse.json({ ...post, likesCount, isLiked: !!likeRecord });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const body = await req.json();
    console.log("Body received:", body);
    let { title, content, tags, images, status } = body;

    if (!title && !content && !tags && !images && !status) {
      console.error("No change to add");
      return NextResponse.json({ error: "No change to add" }, { status: 400 });
    }

    const { id } = await params;
    const numId = Number(id);

    const post = await prisma.post.update({
      where: { id: numId },
      data: { title, content, tags, images, status },
    });

    if (!post) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(post);
  } catch (error) {
    console.error("POST /api/post/[id] error:", error);
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
    const { id } = await params;

    const post = await prisma.user.delete({
      where: { id },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }
  } catch (error) {
    console.error("POST /api/post/[id] error:", error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 },
    );
  }
}
