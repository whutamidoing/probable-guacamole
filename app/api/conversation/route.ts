import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";

const ALLOWED_ORIGIN = "http://localhost:3000";

// export async function POST(req: NextRequest) {
//   try {
//     const { userId } = await auth();

//     if (!userId) {
//       return NextResponse.json(
//         { error: "Unauthorized" },
//         {
//           status: 401,
//           headers: {
//             "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
//           },
//         },
//       );
//     }

//     const body = await req.json();
//     const { participants, messages } = body;

//     const conversation = await prisma.conversation.create({
//       data: {
//         participants: {
//           create: [{ userId: userId }, { userId: participants[1] }],
//         },
//         messages: {
//           create: [
//             {
//               senderId: userId,
//               receiverId: participants[1],
//               content: messages[0].content,
//             },
//           ],
//         },
//       },
//     });

//     return NextResponse.json(conversation, {
//       headers: {
//         "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
//       },
//     });
//   } catch (error) {
//     console.error("POST /api/conversation error:", error);
//     return NextResponse.json(
//       { error: (error as Error).message },
//       {
//         status: 500,
//         headers: {
//           "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
//         },
//       },
//     );
//   }
// }

// export async function GET(req: NextRequest) {
//   try {
//     const { userId } = await auth();

//     if (!userId) {
//       return NextResponse.json(
//         { error: "Unauthorized" },
//         {
//           status: 401,
//           headers: {
//             "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
//           },
//         },
//       );
//     }

//     const { searchParams } = new URL(req.url);
//     const participantId = searchParams.get("participantId");

//     const conversations = await prisma.conversation.findMany({
//       where: {
//         participants: {
//           some: {
//             userId: userId,
//           },
//         },
//       },
//       include: {
//         participants: {
//           include: {
//             user: true,
//           },
//         },
//       },
//     });

//     const result = conversations.map((conversation) => {
//       const otherUser =
//         conversation.participants[0].userId === userId
//           ? conversation.participants[1].user
//           : conversation.participants[0].user;

//       return {
//         id: conversation.id,
//         status: conversation.status,
//         createdAt: conversation.createdAt,
//         otherUser,
//       };
//     });

//     return NextResponse.json(result, {
//       headers: {
//         "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
//       },
//     });
//   } catch (error) {
//     console.error("CONVERSATION /api/conversation/request error:", error);
//     return NextResponse.json(
//       { error: (error as Error).message },
//       {
//         status: 500,
//         headers: {
//           "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
//         },
//       },
//     );
//   }
// }

// export async function OPTIONS() {
//   return new Response("OK", {
//     status: 200,
//     headers: {
//       "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
//       "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
//       "Access-Control-Allow-Headers": "Content-Type, Authorization",
//       "Access-Control-Allow-Credentials": "true",
//     },
//   });
// }
