import {
  experimental_upgradeWebSocket,
  type WebSocketData,
} from "@vercel/functions";

export async function GET() {
  return experimental_upgradeWebSocket((ws) => {
    ws.on("message", (data: WebSocketData) => {
      const payload = JSON.parse(data.toString());

      console.log(payload.message);
      console.log(payload.recipientId);

      ws.send(
        JSON.stringify({
          status: "received",
        }),
      );
    });
  });
}
