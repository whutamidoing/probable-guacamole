import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getCorsOrigin } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
  });

  if (!user) {
    return NextResponse.json(
      { error: "User not found" },
      {
        status: 404,
        headers: {
          "Access-Control-Allow-Origin": getCorsOrigin(req),
        },
      },
    );
  }

  return NextResponse.json(user, {
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
    const body = await req.json();
    console.log("Body received:", body);
    let { userName, fName, lName, bio, profileImg, bannerImg } = body;

    if (!userName && !fName && !lName && !bio && !profileImg && !bannerImg) {
      console.error("No change to add");
      return NextResponse.json(
        { error: "No change to add" },
        {
          status: 400,
          headers: {
            "Access-Control-Allow-Origin": getCorsOrigin(req),
          },
        },
      );
    }

    const { id } = await params;

    const user = await prisma.user.update({
      where: { id },
      data: { userName, fName, lName, bio, profileImg, bannerImg },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        {
          status: 404,
          headers: {
            "Access-Control-Allow-Origin": getCorsOrigin(req),
          },
        },
      );
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
