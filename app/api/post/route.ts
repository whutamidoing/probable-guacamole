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

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("Body received:", body);
    const { title, content, tags, images, authorId, status } = body;

    if (!title || !content || !authorId) {
      console.log("Missing fields!");
      return NextResponse.json(
        { error: "Missing required fields!" },
        { status: 400 },
      );
    }
    let author = await prisma.user.findUnique({ where: { id: authorId } });

    if (!author) {
      console.log("Author not found!");
      return NextResponse.json(
        { error: "Author does not Exist!" },
        { status: 400 },
      );
    }

    let post = await prisma.post.findFirst({
      where: { title },
    });

    if (!post) {
      post = await prisma.post.create({
        data: { title, content, tags, images, authorId, status },
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

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const authorId = searchParams.get("authorId");

  const posts = await prisma.post.findMany({
    where: authorId ? { authorId } : undefined,
    orderBy: {
      createdAt: "desc",
    },
    include: {
      _count: {
        select: {
          likedPost: true,
        },
      },
    },
  });

  return NextResponse.json(posts);
}
