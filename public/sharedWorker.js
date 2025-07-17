
let socket = null;
let ports = [];
const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmcmVzaCI6dHJ1ZSwiaWF0IjoxNzUyNjUzNTQzLCJqdGkiOiI2MGJhYzNlMC00YzE0LTRhZTEtYTRlNy01OTJhYWRmOTljMTkiLCJ0eXBlIjoiYWNjZXNzIiwic3ViIjp7InVzZXIiOnsiaWQiOjEwMywidWlkIjoxLCJsb2dpbiI6Im93bmVyIiwic3RhbXAiOiI5NWZlYWFmNmQwMmY0MWQ1YmNhYmRkNzAyMTY3MWVmYSIsInRlbmFudF9pZCI6NywidGVuYW50X25hbWUiOiJvd25lciIsIm1vZGlmaWVkX29uIjoiMjAyNC0xMC0yNFQxODoxMzozMy4wNDM2OTQrMDA6MDAiLCJkYXRhIjpudWxsLCJleHBpcmVzX2F0IjpudWxsfSwiZGF0YSI6ImZHalNRM01Lc2dtUFFNT3ZvMVlWVE0xUzF4RXVkZzVBVWloNm9Qajh2Mm89IiwicHJvZmlsZSI6eyJpZCI6MSwidXNlcm5hbWUiOiJzd2lmdHdzIiwiZmlyc3RfbmFtZSI6IkFBTUlSIiwibGFzdF9uYW1lIjoiUkVUSVdBTExBIiwiYXNzaWduX2N1c3RvbWVyIjpmYWxzZSwibWFzdGVyX2FkbWluIjp0cnVlLCJzdGF0dXMiOjEsInN0YW1wIjoiNDdkMmY0N2RlOWE1NGYyOTg4ODMzNmViZTIxZDdlYWIiLCJpbWFnZSI6Imh0dHBzOi8va2h1Yi1hcHAuczMtYWNjZWxlcmF0ZS5hbWF6b25hd3MuY29tL21lZGlhL3Byb2QvMzcvdGVuYW50LXVzZXJzL2ltYWdlcy8wMTFkZDJjMy03ZTQwLTRhNDItOTM3NC0zY2ZmMDgwNTM4ZmYiLCJwaG9uZV9ubyI6IisxICg4NzcpIDI5MC0yNjA5IiwicmVzZXRfa2V5IjpudWxsLCJwZXJtaXNzaW9ucyI6W119fSwibmJmIjoxNzUyNjUzNTQzLCJleHAiOjE3NTI3Mzk5NDN9.1hoOEWlvTA-eomFzIKVK2dDzrfhNPwTgd2H9cELvs9o"

onconnect = function (e) {
  const port = e.ports[0];
  ports.push(port);
  port.start();

  console.log("🔌 Port connected");

  port.onmessage = function (event) {
    const data = event.data;
    console.log("📩 Received in worker:", data);

    // Connect to socket only on user action
    if (data.type === "connect_socket") {
      if (!socket || socket.disconnected) {
        console.log("🚀 Connecting socket to server...");

        try {
          importScripts("https://cdn.socket.io/4.7.5/socket.io.min.js");
          console.log("📦 socket.io script loaded");
        } catch (err) {
          console.error("❌ importScripts failed:", err);
          return broadcast({ type: "WSState", state: "error" });
        }

        socket = socket = io("wss://stage.ikhub.biz", {
            transports: ["websocket"],
            query: { token },
            autoConnect: true,
            reconnection: true,
            reconnectionAttempts: 3,
            reconnectionDelay: 2000,
            timeout: 20000,
        });

        socket.on("connect", () => {
          console.log("✅ Socket connected:", socket.id);
          broadcast({ type: "WSState", state: "connected", socketId: socket.id });
        });

        socket.on("connect_error", (err) => {
          console.error("❌ Connection error:", err.message);
          broadcast({ type: "WSState", state: "error" });
        });

        socket.on("disconnect", () => {
          console.warn("⚠️ Socket disconnected");
          broadcast({ type: "WSState", state: "disconnected" });
        });

        socket.on("message", (msg) => {
          console.log("📨 Server message:", msg);
          broadcast({ type: "message", payload: msg });
        });
      }
    }

    if (data.type === "send") {
      console.log("📤 Sending to server:", data.payload);
      socket?.emit("message", data.payload);
    }
  };
};

function broadcast(message) {
  ports.forEach((p) => p.postMessage(message));
}
