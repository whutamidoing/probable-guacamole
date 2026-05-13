import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: number }> },
) {
  const { id } = await params;

  const comment = await prisma.comment.findUnique({
    where: { id },
  });

  if (!comment) {
    return NextResponse.json({ error: "comment not found" }, { status: 404 });
  }

  return NextResponse.json(comment);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: number }> },
) {
  try {
    const body = await req.json();
    console.log("Body received:", body);
    let { content } = body;

    if (!content) {
      console.error("No change to add");
      return NextResponse.json({ error: "No change to add" }, { status: 400 });
    }

    const { id } = await params;

    const comment = await prisma.comment.update({
      where: { id },
      data: { content },
    });

    if (!comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    return NextResponse.json(comment);
  } catch (error) {
    console.error("POST /api/comments/[id] error:", error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 },
    );
  }
}
