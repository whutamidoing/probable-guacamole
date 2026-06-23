import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";

const ALLOWED_ORIGIN = "http://localhost:3000";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
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

    const { id } = await params;

    const friendship = await prisma.friend.findFirst({
      where: {
        OR: [
          {
            userId,
            receiverId: id,
          },
          {
            userId: id,
            receiverId: userId,
          },
        ],
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

    return NextResponse.json(friendship, {
      headers: {
        "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
      },
    }); // null if none exists
  } catch (error) {
    console.error("GET /api/friend/[id] error:", error);

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

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
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
    console.log("Body received:", body);
    let { status } = body;

    if (!status) {
      console.error("Need a reply");
      return NextResponse.json(
        { error: "Need a reply" },
        {
          status: 400,
          headers: {
            "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
          },
        },
      );
    }

    const { id } = await params;
    const numId = Number(id);

    const friend = await prisma.friend.update({
      where: { id: numId },
      data: { status },
    });

    if (!friend) {
      return NextResponse.json(
        { error: "Group not found" },
        {
          status: 404,
          headers: {
            "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
          },
        },
      );
    }

    return NextResponse.json(friend, {
      headers: {
        "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
      },
    });
  } catch (error) {
    console.error("FRIEND /api/friend/[id] error:", error);
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

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
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

    const { id } = await params;
    const numId = Number(id);

    const friend = await prisma.friend.delete({
      where: { id: numId },
    });

    if (!friend) {
      return NextResponse.json(
        { error: "Friend not found" },
        {
          status: 404,
          headers: {
            "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
          },
        },
      );
    }

    return NextResponse.json(friend);
  } catch (error) {
    console.error("FRIEND /api/friend/[id] error:", error);
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
      "Access-Control-Allow-Methods": "GET, POST, DELETE, PATCH, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Credentials": "true",
    },
  });
}
