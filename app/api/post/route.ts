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
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { Post } from "@prisma/client";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const authorId = searchParams.get("authorId");
  const groupId = searchParams.get("groupId");

  const posts = await prisma.post.findMany({
    where: {
      authorId: authorId ?? undefined,
      groupId: Number(groupId) ?? undefined,
    },
    include: {
      likedPost: {
        where: {
          likerId: userId,
        },
        select: {
          likerId: true,
        },
      },
      _count: {
        select: {
          likedPost: true,
        },
      },
    },
  });

  // Reshape response
  const result = posts.map((post) => ({
    ...post,
    likesCount: post._count.likedPost,
    isLiked: post.likedPost.length > 0,
  }));

  return NextResponse.json(result);
}
