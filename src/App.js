import React, { useEffect, useState } from "react";
import {
  initSharedSocket,
  connectSocket,
  sendMessage,
  onSocketEvent,
} from "./socket/sharedSocket";

const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmcmVzaCI6dHJ1ZSwiaWF0IjoxNzUyNjUzNTQzLCJqdGkiOiI2MGJhYzNlMC00YzE0LTRhZTEtYTRlNy01OTJhYWRmOTljMTkiLCJ0eXBlIjoiYWNjZXNzIiwic3ViIjp7InVzZXIiOnsiaWQiOjEwMywidWlkIjoxLCJsb2dpbiI6Im93bmVyIiwic3RhbXAiOiI5NWZlYWFmNmQwMmY0MWQ1YmNhYmRkNzAyMTY3MWVmYSIsInRlbmFudF9pZCI6NywidGVuYW50X25hbWUiOiJvd25lciIsIm1vZGlmaWVkX29uIjoiMjAyNC0xMC0yNFQxODoxMzozMy4wNDM2OTQrMDA6MDAiLCJkYXRhIjpudWxsLCJleHBpcmVzX2F0IjpudWxsfSwiZGF0YSI6ImZHalNRM01Lc2dtUFFNT3ZvMVlWVE0xUzF4RXVkZzVBVWloNm9Qajh2Mm89IiwicHJvZmlsZSI6eyJpZCI6MSwidXNlcm5hbWUiOiJzd2lmdHdzIiwiZmlyc3RfbmFtZSI6IkFBTUlSIiwibGFzdF9uYW1lIjoiUkVUSVdBTExBIiwiYXNzaWduX2N1c3RvbWVyIjpmYWxzZSwibWFzdGVyX2FkbWluIjp0cnVlLCJzdGF0dXMiOjEsInN0YW1wIjoiNDdkMmY0N2RlOWE1NGYyOTg4ODMzNmViZTIxZDdlYWIiLCJpbWFnZSI6Imh0dHBzOi8va2h1Yi1hcHAuczMtYWNjZWxlcmF0ZS5hbWF6b25hd3MuY29tL21lZGlhL3Byb2QvMzcvdGVuYW50LXVzZXJzL2ltYWdlcy8wMTFkZDJjMy03ZTQwLTRhNDItOTM3NC0zY2ZmMDgwNTM4ZmYiLCJwaG9uZV9ubyI6IisxICg4NzcpIDI5MC0yNjA5IiwicmVzZXRfa2V5IjpudWxsLCJwZXJtaXNzaW9ucyI6W119fSwibmJmIjoxNzUyNjUzNTQzLCJleHAiOjE3NTI3Mzk5NDN9.1hoOEWlvTA-eomFzIKVK2dDzrfhNPwTgd2H9cELvs9o"
function App() {
  const [status, setStatus] = useState("not connected");
  const [socketId, setSocketId] = useState(null);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    initSharedSocket();

    onSocketEvent((data) => {
      if (data.type === "WSState") {
        setStatus(data.state);
        if (data.socketId) setSocketId(data.socketId);
      } else if (data.type === "message") {
        setMessages((prev) => [...prev, data.payload]);
      }
    });
  }, []);

  const handleConnect = () => {
    connectSocket(token);
  };

  const handleSend = () => {
    sendMessage("👋 Hello from tab!");
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Socket Status: {status}</h2>
      {socketId && <p>🔗 Socket ID: {socketId}</p>}
      <button onClick={handleConnect}>🔌 Connect Socket</button>
      <button onClick={handleSend} disabled={status !== "connected"}>
        📤 Send Message
      </button>
      <h3>Messages:</h3>
      <ul>
        {messages.map((msg, i) => (
          <li key={i}>🗨️ {msg}</li>
        ))}
      </ul>
    </div>
  );
}

export default App;
