import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const id = Number(params.id);

  const post = await prisma.post.findUnique({
    where: { id },
  });

  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  return NextResponse.json(post);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const body = await req.json();
    console.log("Body received:", body);
    let { title, content, tags, images, status } = body;

    if (!title && !content && !tags && !images && !status) {
      console.error("No change to add");
      return NextResponse.json({ error: "No change to add" }, { status: 400 });
    }

    const id = Number(params.id);

    const post = await prisma.post.update({
      where: { id },
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
