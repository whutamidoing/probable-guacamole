import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const numId = Number(id);

  const comment = await prisma.comment.findUnique({
    where: { id: numId },
  });

  if (!comment) {
    return NextResponse.json({ error: "comment not found" }, { status: 404 });
  }

  return NextResponse.json(comment, { headers: corsHeaders });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
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
    const numId = Number(id);

    const comment = await prisma.comment.update({
      where: { id: numId },
      data: { content },
    });

    if (!comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    return NextResponse.json(comment, { headers: corsHeaders });
  } catch (error) {
    console.error("POST /api/comments/[id] error:", error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 },
    );
  }
}
