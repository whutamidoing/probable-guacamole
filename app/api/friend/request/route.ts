import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";

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
