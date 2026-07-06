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
import { getCorsOrigin } from "@/lib/db";
import { Post } from "@prisma/client";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    console.log("POST /api/posts called, userId:", userId);
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

    const { title, content, tags, images, authorId, status, groupId } = body;

    if (!title || !authorId || (!content && images.length === 0)) {
      console.log(
        `Missing fields! ${title ? "" : "title "}${content ? "" : "content "}${authorId ? "" : "authorId "}`,
      );
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
        data: {
          title,
          content,
          tags,
          images,
          authorId,
          status,
          groupId,
        },
      });
    }

    return NextResponse.json(post, {
      headers: {
        "Access-Control-Allow-Origin": getCorsOrigin(req),
      },
    });
  } catch (error) {
    console.error("POST /api/posts error:", error);
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

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    console.log("GET /api/posts called, userId:", userId);
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

    const { searchParams } = new URL(req.url);
    const authorId = searchParams.get("authorId");
    const groupId = searchParams.get("groupId");

    const posts = await prisma.post.findMany({
      where: {
        authorId: authorId ? authorId : undefined,
        groupId: groupId ? Number(groupId) : undefined,
        parentId: null,
      },
      include: {
        author: {
          select: {
            userName: true,
            profileImg: true,
          },
        },
        likedPost: {
          where: {
            likerId: userId,
          },
          select: {
            likerId: true,
          },
        },
        group: {
          select: {
            groupName: true,
            groupImg: true,
            bannerImg: true,
          },
        },
        _count: {
          select: {
            likedPost: true,
          },
        },
      },
    });
    const result = posts.map((post) => ({
      ...post,
      likesCount: post._count.likedPost,
      isLiked: post.likedPost.length > 0,
    }));

    return NextResponse.json(result, {
      headers: {
        "Access-Control-Allow-Origin": getCorsOrigin(req),
      },
    });
  } catch (err) {
    console.error("GET ERROR:", err);

    return NextResponse.json(
      { error: String(err) },
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
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Credentials": "true",
    },
  });
}
