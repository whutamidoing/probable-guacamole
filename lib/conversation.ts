import { prisma } from "./db";

export async function findOrCreateConversation(participants: string[]) {
  const existingConversation = await prisma.conversation.findFirst({
    where: {
      isGroup: false,

      participants: {
        every: {
          participantId: {
            in: participants,
          },
        },
      },
    },

    include: {
      participants: true,
    },
  });

  if (existingConversation) {
    return existingConversation;
  }

  return prisma.conversation.create({
    data: {
      isGroup: participants.length > 2,

      participants: {
        create: participants.map((participantId) => ({
          participantId,
        })),
      },
    },

    include: {
      participants: true,
    },
  });
}

export async function createMessage(
  content: string,
  senderId: string,
  conversationId: number,
) {
  console.log("NEW createMessage VERSION 2026-07-18");
  const message = await prisma.message.create({
    data: {
      content,
      senderId,
      conversationId,
    },
    include: {
      sender: true,
    },
  });
  return message;
}
