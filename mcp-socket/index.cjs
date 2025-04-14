const WebSocket = require("ws");
const { v4: uuidv4 } = require("uuid");

const PORT = process.env.PORT || 3055;

// Create a WebSocket server
const wss = new WebSocket.Server({ port: PORT });
console.log(`WebSocket server started on port ${PORT}`);

// Handle new client connections
wss.on("connection", (ws) => {
  const connectionId = uuidv4();
  console.log("[connection]", connectionId);

  // Handle incoming message
  ws.on("message", (message) => {
    console.log("[message]", message.toString());

    // Broadcast message to all connected clients
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message.toString());
      }
    });
  });

  // Handle client disconnection
  ws.on("close", () => {
    console.log("[close]", connectionId);
  });

  // Handle errors
  ws.on("error", (error) => {
    console.error("[error]", error);
  });
});
