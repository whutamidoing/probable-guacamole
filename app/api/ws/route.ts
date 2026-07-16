import {
  experimental_upgradeWebSocket,
  type WebSocketData,
} from "@vercel/functions";

export async function GET() {
  return experimental_upgradeWebSocket((ws) => {
    ws.on("message", (data: WebSocketData) => {
      ws.send(data);
    });
  });
}
