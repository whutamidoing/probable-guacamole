import { prisma } from "./db";

export async function findOrCreateConversation(
  participants: string[],
  content: string,
  senderId: string,
) {
  const sortedParticipants = [...participants].sort();

  const existingConversations = await prisma.conversation.findMany({
    where: {
      isGroup: false,
      participants: {
        every: {
          participantId: {
            in: sortedParticipants,
          },
        },
      },
    },
    include: {
      participants: true,
    },
  });

  if (existingConversations.length > 0) {
    return existingConversations[0];
  }

  const receiverId = participants.find(
    (participantId) => participantId !== senderId,
  );

  if (!receiverId) {
    throw new Error("Could not find receiver");
  }

  const conversation = await prisma.conversation.create({
    data: {
      isGroup: participants.length > 2,

      participants: {
        create: participants.map((participantId) => ({
          participantId,
        })),
      },

      messages: {
        create: {
          content,
          senderId,
          receiverId,
        },
      },
    },

    include: {
      participants: true,
      messages: true,
    },
  });

  return conversation;
}

export async function createMessage(
  content: string,
  senderId: string,
  conversationId: number,
) {
  const message = await prisma.message.create({
    data: {
      content,
      senderId,
      conversationId,
      createdAt: new Date().toLocaleDateString("en-US"),
    },
  });
  return message;
}
