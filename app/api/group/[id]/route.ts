import { NextResponse, NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { getCorsOrigin } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
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

  const { id } = await params;
  const numId = Number(id);

  const group = await prisma.group.findUnique({
    where: { id: numId },
    include: {
      groupMembers: {
        where: {
          memberId: userId,
        },
        select: {
          memberId: true,
          role: true,
        },
      },
      _count: {
        select: {
          groupMembers: true,
        },
      },
    },
  });

  if (!group) {
    return NextResponse.json(
      { error: "Group not found" },
      {
        status: 404,
        headers: {
          "Access-Control-Allow-Origin": getCorsOrigin(req),
        },
      },
    );
  }

  const result = {
    ...group,
    populationCount: group._count.groupMembers,
    isFollowed: group.groupMembers.length > 0,
    isAdmin: group?.groupMembers[0]?.role === "admin",
  };

  return NextResponse.json(result, {
    headers: {
      "Access-Control-Allow-Origin": getCorsOrigin(req),
    },
  });
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
            "Access-Control-Allow-Origin": getCorsOrigin(req),
          },
        },
      );
    }

    const body = await req.json();
    console.log("Body received:", body);
    let { groupName, description, groupImg, bannerImg, groupThemes } = body;

    if (!groupName && !description && !groupImg && !bannerImg && !groupThemes) {
      console.error("No change to add");
      return NextResponse.json({ error: "No change to add" }, { status: 400 });
    }

    const { id } = await params;
    const numId = Number(id);

    const group = await prisma.group.update({
      where: { id: numId },
      data: { groupName, description, groupImg, bannerImg, groupThemes },
    });

    if (!group) {
      return NextResponse.json(
        { error: "Group not found" },
        {
          status: 404,
          headers: {
            "Access-Control-Allow-Origin": getCorsOrigin(req),
          },
        },
      );
    }

    return NextResponse.json(group, {
      headers: {
        "Access-Control-Allow-Origin": getCorsOrigin(req),
      },
    });
  } catch (error) {
    console.error("GROUP /api/group/[id] error:", error);
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
            "Access-Control-Allow-Origin": getCorsOrigin(req),
          },
        },
      );
    }

    const { id } = await params;
    const numId = Number(id);

    const group = await prisma.group.delete({
      where: { id: numId },
    });

    if (!group) {
      return NextResponse.json(
        { error: "Group not found" },
        {
          status: 404,
          headers: {
            "Access-Control-Allow-Origin": getCorsOrigin(req),
          },
        },
      );
    }

    return NextResponse.json(group, {
      headers: {
        "Access-Control-Allow-Origin": getCorsOrigin(req),
      },
    });
  } catch (error) {
    console.error("GROUP /api/group/[id] error:", error);
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

export async function OPTIONS(req: NextRequest) {
  return new Response("OK", {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": getCorsOrigin(req),
      "Access-Control-Allow-Methods": "GET, POST, DELETE, PATCH, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Credentials": "true",
    },
  });
}
