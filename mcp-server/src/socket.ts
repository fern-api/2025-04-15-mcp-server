import { v4 as uuidv4 } from "uuid";
import WebSocket from "ws";

let ws: WebSocket | null = null;

const pendingRequests = new Map<
  string,
  {
    resolve: (value: unknown) => void;
    reject: (reason: unknown) => void;
    timeout: NodeJS.Timeout;
  }
>();

// Function to send commands to Webflow
export function sendCommandToSocket(
  command_name: string,
  params: unknown = {}
): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const id = uuidv4();
    const request = {
      id: id,
      command_name: command_name,
      params: params,
      clientType: "mcp",
    };

    console.error(`[WebSocket] Sending request: ${JSON.stringify(request)}`);

    // Set timeout for request
    const timeout = setTimeout(() => {
      if (pendingRequests.has(id)) {
        console.error(`[WebSocket] Request ${id} timed out`);
        pendingRequests.delete(id);
        reject(new Error(`Request ${id} timed out`));
      }
    }, 30000); // 30 second timeout

    // Store the promise callbacks to resolve/reject later
    pendingRequests.set(id, { resolve, reject, timeout });

    // Send the request
    try {
      ws.send(JSON.stringify(request));
      console.error(`[WebSocket] Request ${id} sent successfully`);
    } catch (error) {
      console.error(`[WebSocket] Error sending request: ${error}`);
      clearTimeout(timeout);
      pendingRequests.delete(id);
      reject(new Error(`Failed to send request: ${error}`));
    }
  });
}

// Connect to WebSocket server
export function connectToSocket(port: number) {
  try {
    ws = new WebSocket(`ws://localhost:${port}`);
    console.error(`[WebSocket] Connecting to ${ws.url}...`);

    ws.on("open", () => {
      console.error(`[WebSocket] Open`);
    });

    ws.on("message", (data: unknown) => {
      try {
        const response = JSON.parse(data.toString());
        console.error(`[WebSocket] Message: ${JSON.stringify(response)}`);

        if (response.clientType === "mcp") {
          return;
        }

        if (response && response.id && pendingRequests.has(response.id)) {
          console.error(`[WebSocket] Found match for request ${response.id}`);
          const request = pendingRequests.get(response.id)!;
          clearTimeout(request.timeout);

          if (response.error) {
            console.error(
              `[WebSocket] Request ${response.id} failed: ${response.error}`
            );
            request.reject(new Error(response.error));
          } else {
            console.error(`[WebSocket] Request ${response.id} succeeded`);
            request.resolve(response);
          }

          pendingRequests.delete(response.id);
        } else if (response && response.id) {
          console.error(
            `[WebSocket] Received response for unknown request ${response.id}`
          );
        } else {
          console.error(`[WebSocket] Received response without ID`);
        }
      } catch (error) {
        console.error(`[WebSocket] Error processing message: ${error}`);
      }
    });

    ws.on("error", (error) => {
      console.error(`[WebSocket] Connection error: ${error}`);
      ws = null;
    });

    ws.on("close", (code, reason) => {
      console.error(`[WebSocket] Connection closed: ${code} ${reason}`);
      ws = null;

      // Reject all pending requests
      for (const [id, request] of pendingRequests.entries()) {
        clearTimeout(request.timeout);
        request.reject(new Error("Connection closed"));
        pendingRequests.delete(id);
      }

      // Attempt to reconnect
      console.error(`[WebSocket] Will try to reconnect in 2 seconds`);
      setTimeout(() => connectToSocket(port), 2000);
    });
    return ws;
  } catch (error) {
    console.error(`[WebSocket] Error creating connection: ${error}`);
    ws = null;
    setTimeout(() => connectToSocket(port), 2000);
  }
}
