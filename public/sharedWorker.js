let socket = null;
const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmcmVzaCI6dHJ1ZSwiaWF0IjoxNzUyNjUzNTQzLCJqdGkiOiI2MGJhYzNlMC00YzE0LTRhZTEtYTRlNy01OTJhYWRmOTljMTkiLCJ0eXBlIjoiYWNjZXNzIiwic3ViIjp7InVzZXIiOnsiaWQiOjEwMywidWlkIjoxLCJsb2dpbiI6Im93bmVyIiwic3RhbXAiOiI5NWZlYWFmNmQwMmY0MWQ1YmNhYmRkNzAyMTY3MWVmYSIsInRlbmFudF9pZCI6NywidGVuYW50X25hbWUiOiJvd25lciIsIm1vZGlmaWVkX29uIjoiMjAyNC0xMC0yNFQxODoxMzozMy4wNDM2OTQrMDA6MDAiLCJkYXRhIjpudWxsLCJleHBpcmVzX2F0IjpudWxsfSwiZGF0YSI6ImZHalNRM01Lc2dtUFFNT3ZvMVlWVE0xUzF4RXVkZzVBVWloNm9Qajh2Mm89IiwicHJvZmlsZSI6eyJpZCI6MSwidXNlcm5hbWUiOiJzd2lmdHdzIiwiZmlyc3RfbmFtZSI6IkFBTUlSIiwibGFzdF9uYW1lIjoiUkVUSVdBTExBIiwiYXNzaWduX2N1c3RvbWVyIjpmYWxzZSwibWFzdGVyX2FkbWluIjp0cnVlLCJzdGF0dXMiOjEsInN0YW1wIjoiNDdkMmY0N2RlOWE1NGYyOTg4ODMzNmViZTIxZDdlYWIiLCJpbWFnZSI6Imh0dHBzOi8va2h1Yi1hcHAuczMtYWNjZWxlcmF0ZS5hbWF6b25hd3MuY29tL21lZGlhL3Byb2QvMzcvdGVuYW50LXVzZXJzL2ltYWdlcy8wMTFkZDJjMy03ZTQwLTRhNDItOTM3NC0zY2ZmMDgwNTM4ZmYiLCJwaG9uZV9ubyI6IisxICg4NzcpIDI5MC0yNjA5IiwicmVzZXRfa2V5IjpudWxsLCJwZXJtaXNzaW9ucyI6W119fSwibmJmIjoxNzUyNjUzNTQzLCJleHAiOjE3NTI3Mzk5NDN9.1hoOEWlvTA-eomFzIKVK2dDzrfhNPwTgd2H9cELvs9o"
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

        socket = io("wss://stage.ikhub.biz", {
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
