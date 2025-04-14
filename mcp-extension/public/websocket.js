let socket = null;
export function connectWebSocket() {
    // Clear any existing connection
    if (socket) {
        socket.close();
    }
    try {
        console.log("Connecting to WebSocket server on port 3055...");
        socket = new WebSocket("ws://localhost:3055");
        socket.onopen = () => {
            console.log("✅ Connected to WebSocket server");
        };
        socket.onclose = (event) => {
            console.log(`❌ Disconnected from WebSocket server: ${event.code} ${event.reason}`);
        };
        socket.onerror = (error) => {
            console.error("❌ WebSocket error:", error);
        };
        socket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                console.log("Received message:", data);
            }
            catch (error) {
                console.error("Error parsing WebSocket message:", error);
            }
        };
    }
    catch (error) {
        console.error("Error creating WebSocket connection:", error);
    }
}
export function sendMessage(message) {
    if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify(message));
    }
    else {
        console.error("WebSocket is not connected");
    }
}
