import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
        otherUser,
      };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("FRIEND /api/friend/request error:", error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 },
    );
  }
}
