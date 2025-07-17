let socket = null;
const token = ""
const clients = [];

function broadcast(message) {
  clients.forEach((port) => port.postMessage(message));
}

onconnect = function (e) {
  const port = e.ports[0];
  clients.push(port);
  console.log("🔌 SharedWorker connected to a new tab");

  port.onmessage = function (event) {
    const { type, payload } = event.data;

    switch (type) {
      case "init":
        console.log("🚀 Worker initialized");
        break;

      case "connect":
        if (socket && socket.connected) {
          console.log("⚠️ Socket already connected");
          return;
        }

        importScripts("https://cdn.socket.io/4.7.2/socket.io.min.js");

        socket = io("wss://preprod.ikhub.biz", {
            transports: ["websocket"],
            query: { token },
            autoConnect: true,
            reconnection: true,
            reconnectionAttempts: 3,
            reconnectionDelay: 2000,
            timeout: 20000,
        });

        socket.on("connect", () => {
          console.log("✅ Socket connected", socket.id);
          broadcast({ type: "WSState", state: "connected", socketId: socket.id });
        });

        socket.on("disconnect", () => {
          console.log("🔌 Socket disconnected");
          broadcast({ type: "WSState", state: "disconnected" });
        });

        socket.on("connect_error", (err) => {
          console.error("❌ Connection error:", err.message);
          broadcast({ type: "WSState", state: "error", error: err.message });
        });

        socket.on("scan_result", (data) => {
          broadcast({ type: "scan_result", state: "result", data });
        });

        socket.on("pong", (data) => {
          broadcast({ type: "message", payload: data });
        });

        // Auto ping every 10 seconds
        setInterval(() => {
          if (socket && socket.connected) {
            socket.emit("ping", { time: new Date().toISOString() });
            console.log("🔁 Auto-ping sent");
          }
        }, 10000); // every 10 seconds

        break;

      case "disconnect":
        if (socket) {
            console.log("❌ Disconnecting socket...");
            socket.disconnect();
            socket = null;
            broadcast({ type: "WSState", state: "disconnected" });
            broadcast({ type: "socketId", id: null });
        }
        break;

      case "sendMessage":
        if (socket && socket.connected) {
          socket.emit("ping", payload);
          console.log("📤 Sent ping:", payload);
        } else {
          console.warn("⚠️ Can't send, socket not connected.");
        }
        break;

      default:
        console.warn("Unknown message type:", type);
    }
  };
};
