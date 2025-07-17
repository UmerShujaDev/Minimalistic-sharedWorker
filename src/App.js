import React, { useEffect, useState } from "react";
import {
  initSharedWorker,
  connectSocket,
  disconnectSocket,
  sendMessage,
  onSocketEvent,
} from "./socket/sharedSocket";

const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmcmVzaCI6dHJ1ZSwiaWF0IjoxNzUyNjUzNTQzLCJqdGkiOiI2MGJhYzNlMC00YzE0LTRhZTEtYTRlNy01OTJhYWRmOTljMTkiLCJ0eXBlIjoiYWNjZXNzIiwic3ViIjp7InVzZXIiOnsiaWQiOjEwMywidWlkIjoxLCJsb2dpbiI6Im93bmVyIiwic3RhbXAiOiI5NWZlYWFmNmQwMmY0MWQ1YmNhYmRkNzAyMTY3MWVmYSIsInRlbmFudF9pZCI6NywidGVuYW50X25hbWUiOiJvd25lciIsIm1vZGlmaWVkX29uIjoiMjAyNC0xMC0yNFQxODoxMzozMy4wNDM2OTQrMDA6MDAiLCJkYXRhIjpudWxsLCJleHBpcmVzX2F0IjpudWxsfSwiZGF0YSI6ImZHalNRM01Lc2dtUFFNT3ZvMVlWVE0xUzF4RXVkZzVBVWloNm9Qajh2Mm89IiwicHJvZmlsZSI6eyJpZCI6MSwidXNlcm5hbWUiOiJzd2lmdHdzIiwiZmlyc3RfbmFtZSI6IkFBTUlSIiwibGFzdF9uYW1lIjoiUkVUSVdBTExBIiwiYXNzaWduX2N1c3RvbWVyIjpmYWxzZSwibWFzdGVyX2FkbWluIjp0cnVlLCJzdGF0dXMiOjEsInN0YW1wIjoiNDdkMmY0N2RlOWE1NGYyOTg4ODMzNmViZTIxZDdlYWIiLCJpbWFnZSI6Imh0dHBzOi8va2h1Yi1hcHAuczMtYWNjZWxlcmF0ZS5hbWF6b25hd3MuY29tL21lZGlhL3Byb2QvMzcvdGVuYW50LXVzZXJzL2ltYWdlcy8wMTFkZDJjMy03ZTQwLTRhNDItOTM3NC0zY2ZmMDgwNTM4ZmYiLCJwaG9uZV9ubyI6IisxICg4NzcpIDI5MC0yNjA5IiwicmVzZXRfa2V5IjpudWxsLCJwZXJtaXNzaW9ucyI6W119fSwibmJmIjoxNzUyNjUzNTQzLCJleHAiOjE3NTI3Mzk5NDN9.1hoOEWlvTA-eomFzIKVK2dDzrfhNPwTgd2H9cELvs9o"

function App() {
  const [socketState, setSocketState] = useState("disconnected");
  const [socketId, setSocketId] = useState("");

   const handleSocketEvents = (event) => {
    debugger;

    if (event.type === "WSState") {
      setSocketState(event.state);
      setSocketId(event.id);
    } else if(event.type === "message") {
      const { user, data } = event.payload 
      console.log("user, data", user, data);
    } else if(event.type === "scan_result") {
      console.log("🚀 ~ handleSocketEvents ~ event:", event)
    }
  };

  useEffect(() => {
    initSharedWorker();
    onSocketEvent(handleSocketEvents);
  }, []);

  return (
    <div style={{ padding: 40 }}>
      <h2>🔗 SharedWorker Socket.IO Demo</h2>
      <p>Status: <strong>{socketState}</strong></p>
      <p>Socket ID: <code>{socketId}</code></p>

      <button onClick={() => connectSocket(token)} disabled={socketState === "connected"}>
        🔌 Connect Socket
      </button>

      <button onClick={() => disconnectSocket()} disabled={socketState !== "connected"}>
        ❌ Disconnect Socket
      </button>
      
      <button onClick={() => sendMessage({ time: new Date().toISOString() })} disabled={socketState !== "connected"}>
        📨 Send Message
      </button>
    </div>
  );
}

export default App;
