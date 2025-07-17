let socket = null;
const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmcmVzaCI6dHJ1ZSwiaWF0IjoxNzUyNzU4MjU5LCJqdGkiOiJiMjU5ZWRkMi0xMDgwLTQzMDUtYmU1MS1jOWZmNjUxNTQ2ODciLCJ0eXBlIjoiYWNjZXNzIiwic3ViIjp7InVzZXIiOnsiaWQiOjEsInVpZCI6MTIsImxvZ2luIjoicHJlcHJvZCIsInN0YW1wIjoiOGYxZGNmYzZkNWVmNGVlNzllZjVkNzJkMzc5NzhkM2QiLCJ0ZW5hbnRfaWQiOjEsInRlbmFudF9uYW1lIjoicHJlcHJvZCIsIm1vZGlmaWVkX29uIjoiMjAyNC0wMi0yOVQxOToxMzozMy4xNzgzOTErMDA6MDAiLCJkYXRhIjpudWxsLCJleHBpcmVzX2F0IjpudWxsfSwiZGF0YSI6IkJ3Tjhhb3dwVk5Bd3NXM2VENlRic3I3MklNYittaHRTZDE0OEZMTStsNlE9IiwicHJvZmlsZSI6eyJpZCI6MTIsInVzZXJuYW1lIjoicHJlcHJvZCIsImZpcnN0X25hbWUiOiJQUkVQUk9EIiwibGFzdF9uYW1lIjoiQm90IiwiYXNzaWduX2N1c3RvbWVyIjpmYWxzZSwibWFzdGVyX2FkbWluIjp0cnVlLCJzdGF0dXMiOjEsInN0YW1wIjoiNTJiMTk0ZmQxNGJmNDI3Mzg1NjA1NWNmNmQwMWQwN2UiLCJpbWFnZSI6Imh0dHBzOi8va2h1Yi1hcHAtZGV2LnMzLWFjY2VsZXJhdGUuYW1hem9uYXdzLmNvbS9tZWRpYS9wcmVwcm9kLzEvdGVuYW50LXVzZXJzL2ltYWdlcy9jNzQ2ZjI5MS0wY2I3LTQ1ZjgtYThkOC1kMzE0NDlhMjIxMjAiLCJwaG9uZV9ubyI6Iis0MjEgKDQxMikgOTQxLTIwNCIsInJlc2V0X2tleSI6bnVsbCwicGVybWlzc2lvbnMiOlsxMzAsMTMxLDEwLDE0MCwxMiwxNDIsMjAsMjIsMTUwLDE1MiwzMCwzMiwxNjAsNDAsNDIsMTcwLDE3MSw1MCw1Miw2MCw2Miw3MCw3Miw4MCw4Miw5MCw5MiwxMDAsMTAyLDExMCwxMTIsMTIwLDEyMl19fSwibmJmIjoxNzUyNzU4MjU5LCJleHAiOjE3NTI4NDQ2NTl9.GenuIGjGhXIlTljxTNnveuAw9mC8DXNawdIaU_jgUnY"
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
