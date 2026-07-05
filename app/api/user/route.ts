import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { getCorsOrigin } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("Body received:", body);
    let { id, userName, email, fName, lName, profileImg, bannerImg } = body;

    if (!userName || !email) {
      console.error("Missing required fields: userName or email");
      return NextResponse.json(
        { error: "Missing required fields" },
        {
          status: 400,
          headers: {
            "Access-Control-Allow-Origin": getCorsOrigin(req),
          },
        },
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

    return NextResponse.json(user, {
      headers: {
        "Access-Control-Allow-Origin": getCorsOrigin(req),
      },
    });
  } catch (error) {
    console.error("POST /api/user error:", error);
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

export async function GET(req: NextRequest) {
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

  const users = await prisma.user.findMany();
  return NextResponse.json(users, {
    headers: {
      "Access-Control-Allow-Origin": getCorsOrigin(req),
    },
  });
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
