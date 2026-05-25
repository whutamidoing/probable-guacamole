import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    console.log("Body received:", body);
    let { status } = body;

    if (!status) {
      console.error("Need a reply");
      return NextResponse.json({ error: "Need a reply" }, { status: 400 });
    }

    const { id } = await params;
    const numId = Number(id);

    const friend = await prisma.friend.update({
      where: { id: numId },
      data: { status },
    });

    if (!friend) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    return NextResponse.json(friend);
  } catch (error) {
    console.error("FRIEND /api/friend/[id] error:", error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 },
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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const numId = Number(id);

    const friend = await prisma.friend.delete({
      where: { id: numId },
    });

    if (!friend) {
      return NextResponse.json({ error: "Friend not found" }, { status: 404 });
    }

    return NextResponse.json(friend);
  } catch (error) {
    console.error("FRIEND /api/friend/[id] error:", error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 },
    );
  }
}
