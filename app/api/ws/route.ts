import {
  experimental_upgradeWebSocket,
  type WebSocketData,
} from "@vercel/functions";
import { createMessage, findOrCreateConversation } from "@/lib/conversation";
import type { WebSocket as WSWebSocket } from "ws";

const connectedUsers = new Map<string, WSWebSocket>();

export async function GET() {
  return experimental_upgradeWebSocket((ws) => {
    ws.on("message", async (data: WebSocketData) => {
      try {
        const payload = JSON.parse(data.toString());

        if (payload) {
          console.log("payload received:");
          console.log(payload);
        }

        if (payload.type === "authenticate") {
          connectedUsers.set(payload.userId, ws);

          ws.send(
            JSON.stringify({
              type: "authenticated",
            }),
          );

          return;
        }

        const { content, senderId, receiverId } = payload;

        const conversation = await findOrCreateConversation([
          senderId,
          receiverId,
        ]);

        const message = await createMessage(content, senderId, conversation.id);

        const receiverSocket = connectedUsers.get(receiverId);

        if (receiverSocket) {
          receiverSocket.send(
            JSON.stringify({
              type: "message",
              payload,
            }),
          );
        }

        ws.send(
          JSON.stringify({
            type: "message",
            message,
          }),
        );
      } catch (error) {
        console.error("WebSocket message error:", error);

        ws.send(
          JSON.stringify({
            type: "error",
            message: "Failed to send message",
          }),
        );
      }
    });
  });
}
