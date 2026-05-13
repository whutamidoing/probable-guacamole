/* Postgres
import { PrismaClient } from "@/app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

export const prisma = new PrismaClient({
  adapter,
});
*/

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("Body received:", body);
    const { title, content, tags, images, author } = body;

    if (!title || !content || !author) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    let post = await prisma.post.findFirst({
      where: { title },
    });

    if (!post) {
      post = await prisma.post.create({
        data: { title, content, tags, images, author },
      });
    }

    return NextResponse.json(post);
  } catch (error) {
    console.error("POST /api/posts error:", error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 },
    );
  }
}

export async function GET() {
  const posts = await prisma.post.findMany();
  return NextResponse.json(posts);
}