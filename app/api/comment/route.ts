import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { getCorsOrigin } from "@/lib/db";
import { Comment } from "@prisma/client";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
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
    let { content, postId, commenterId, parentId } = body;

    if (!content || !postId || !userId) {
      console.log("Missing fields!");
      return NextResponse.json(
        { error: "Missing required fields!" },
        {
          status: 400,
          headers: {
            "Access-Control-Allow-Origin": getCorsOrigin(req),
          },
        },
      );
    }

    const comment = await prisma.comment.create({
      data: { commenterId, content, postId, parentId },
      include: {
        commenter: true,
      },
    });

    return NextResponse.json(comment, {
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
  const { userId } = await auth();
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
  const postId = Number(searchParams.get("postId"));

  const comments = await prisma.comment.findMany({
    where: { postId: postId || undefined, parentId: null },
    include: {
      commenter: {
        select: {
          userName: true,
          profileImg: true,
        },
      },
    },
  });

  const commentsWithLikes = await Promise.all(
    comments.map(async (comment) => {
      const likesCount = await prisma.commentLike.count({
        where: { commentId: comment.id },
      });

      const isLiked = await prisma.commentLike.findUnique({
        where: {
          commentId_likerId: {
            commentId: comment.id,
            likerId: userId,
          },
        },
      });

      return {
        ...comment,
        likesCount,
        isLiked: !!isLiked,
      };
    }),
  );

  const tree = buildTree(commentsWithLikes);

  return NextResponse.json(tree, {
    headers: {
      "Access-Control-Allow-Origin": getCorsOrigin(req),
    },
  });
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

function buildTree(comments: Comment[]) {
  const map = new Map();

  comments.forEach((c) => {
    map.set(c.id, {
      ...c,
      replies: [],
    });
  });

  const roots: Comment[] = [];

  comments.forEach((c) => {
    const node = map.get(c.id);

    if (c.parentId) {
      map.get(c.parentId)?.replies.push(node);
    } else {
      roots.push(node);
    }
  });

  return roots;
}
