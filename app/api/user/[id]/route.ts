import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json(user);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const body = await req.json();
    console.log("Body received:", body);
    let { fName, lName, profileImg, bannerImg } = body;

    if (!fName && !lName && !profileImg && !bannerImg) {
      console.error("No change to add");
      return NextResponse.json({ error: "No change to add" }, { status: 400 });
    }

    const { id } = await params;

    const user = await prisma.user.update({
      where: { id },
      data: { fName, lName, profileImg, bannerImg },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("POST /api/user error:", error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 },
    );
  }
}
