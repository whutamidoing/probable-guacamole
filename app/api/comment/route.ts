import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

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

    return NextResponse.json(comment, { headers: corsHeaders });
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
  return NextResponse.json(comments, { headers: corsHeaders });
}
