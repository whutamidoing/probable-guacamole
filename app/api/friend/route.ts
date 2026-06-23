import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";

const ALLOWED_ORIGIN = "http://localhost:3000";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        {
          status: 401,
          headers: {
            "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
          },
        },
      );
    }

    const body = await req.json();

    const { receiverId } = body;

    if (!receiverId) {
      return NextResponse.json(
        { error: "Missing receiverId" },
        {
          status: 400,
          headers: {
            "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
          },
        },
      );
    }

    const senderId = userId;

    const existingFriend = await prisma.friend.findFirst({
      where: {
        OR: [
          {
            receiverId,
            userId: senderId,
          },
          {
            receiverId: senderId,
            userId: receiverId,
          },
        ],
      },
    });

    if (existingFriend) {
      return NextResponse.json(
        { error: "Friend request already exists" },
        {
          status: 409,
          headers: {
            "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
          },
        },
      );
    }

    const friend = await prisma.friend.create({
      data: {
        receiverId,
        userId: senderId,
        status: "PENDING",
      },
    });

    return NextResponse.json(friend, {
      headers: {
        "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
      },
    });
  } catch (error) {
    console.error("POST /api/friend error:", error);
    return NextResponse.json(
      { error: (error as Error).message },
      {
        status: 500,
        headers: {
          "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
        },
      },
    );
  }
}

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        {
          status: 401,
          headers: {
            "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
          },
        },
      );
    }

    const friends = await prisma.friend.findMany({
      where: {
        status: "ACCEPTED",
        OR: [{ userId }, { receiverId: userId }],
      },

      include: {
        receiver: {
          select: {
            id: true,
            userName: true,
            profileImg: true,
          },
        },

        user: {
          select: {
            id: true,
            userName: true,
            profileImg: true,
          },
        },
      },
    });

    const result = friends.map((friend) => {
      const otherUser =
        friend.userId === userId ? friend.receiver : friend.user;

      return {
        id: friend.id,
        status: friend.status,
        createdAt: friend.createdAt,
        otherUser,
      };
    });

    return NextResponse.json(result, {
      headers: {
        "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
      },
    });
  } catch (error) {
    console.error("FRIEND /api/friend/request error:", error);
    return NextResponse.json(
      { error: (error as Error).message },
      {
        status: 500,
        headers: {
          "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
        },
      },
    );
  }
}

export async function OPTIONS() {
  return new Response("OK", {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Credentials": "true",
    },
  });
}
