import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("Body received:", body);
    let { content, post } = body;

    if (!content) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    let comment = await prisma.comment.create({
      data: { content, post },
    });

    return NextResponse.json(comment);
  } catch (error) {
    console.error("POST /api/users error:", error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 },
    );
  }
}

export async function GET() {
  const comments = await prisma.post.findMany();
  return NextResponse.json(comments);
}