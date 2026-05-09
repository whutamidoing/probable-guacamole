import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("Body received:", body);
    let { id, userName, email, fName, lName, profileImg, bannerImg } = body;

    if (!userName || !email) {
      console.error("Missing required fields: userName or email");
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    let user = await prisma.user.findFirst({
      where: { email: email },
    });

    if (!user) {
      console.log("USER CREATED");
      user = await prisma.user.create({
        data: { id, userName, email, fName, lName, profileImg, bannerImg },
      });
    }

    if (user) {
      console.log("USER ALREADY EXISTS");
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

export async function GET() {
  const users = await prisma.user.findMany();
  return NextResponse.json(users);
}
