import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("Body received:", body);
    let { userName, email, fName, lName, profileImg, bannerImg } = body;

    if (!fName || !lName || !email) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    let user = await prisma.user.findFirst({
      where: { email: email },
    });

    if (!user?.userName) {
      userName = fName + " " + lName;
    }

    if (!user) {
      user = await prisma.user.create({
        data: { userName, email, fName, lName, profileImg, bannerImg },
      });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("POST /api/users error:", error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 },
    );
  }
}
