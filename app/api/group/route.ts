import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { Group, Post } from "@prisma/client";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unmemberized" }, { status: 401 });
    }

    const body = await req.json();
    console.log("Body received:", body);
    const { groupName, description, groupImg, bannerImg } = body;

    if (!groupName || !description || !groupImg || !bannerImg) {
      console.log("Missing fields!");
      return NextResponse.json(
        { error: "Missing required fields!" },
        { status: 400 },
      );
    }
    let group = await prisma.group.findUnique({ where: { groupName } });

    if (group) {
      console.log("Group already exist!");
      return NextResponse.json(
        { error: "Group already exist!" },
        { status: 400 },
      );
    }

    group = await prisma.group.create({
      data: {
        groupName,
        description,
        groupImg,
        bannerImg,
        groupMembers: {
          create: {
            memberId: userId,
            role: "admin",
          },
        },
      },
    });

    return NextResponse.json(group);
  } catch (error) {
    console.error("GROUP /api/group error:", error);
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
  const memberId = searchParams.get("memberId");

  const groups = await prisma.group.findMany({
    where: { groupMembers: { some: { memberId: memberId ?? undefined } } },
    include: {
      groupMembers: {
        where: {
          memberId: userId,
        },
        select: {
          memberId: true,
        },
      },
      _count: {
        select: {
          groupMembers: true,
        },
      },
    },
  });

  // Reshape response
  const result = groups.map((group) => ({
    ...group,
    populationCount: group._count.groupMembers,
    isFollowed: group.groupMembers.length > 0,
  }));

  return NextResponse.json(result);
}
