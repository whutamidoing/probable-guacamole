import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    const { receiverId } = body;

    if (!receiverId) {
      return NextResponse.json(
        { error: "Missing receiverId" },
        { status: 400 },
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
        { status: 409 },
      );
    }

    const friend = await prisma.friend.create({
      data: {
        receiverId,
        userId: senderId,
        status: "PENDING",
      },
    });

    return NextResponse.json(friend);
  } catch (error) {
    console.error("POST /api/friend error:", error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 },
    );
  }
}

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const friends = await prisma.friend.findMany({
    where: {
      receiverId: userId,
      status: "PENDING",
    },

    include: {
      user: {
        select: {
          id: true,
          userName: true,
          profileImg: true,
        },
      },
    },
  });

  const result = friends.map((friend) => ({
    id: friend.id,
    status: friend.status,

    sender: friend.user,
  }));

  return NextResponse.json(result);
}
