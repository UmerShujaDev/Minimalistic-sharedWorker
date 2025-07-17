import React, { useEffect, useState } from "react";
import {
  initSharedWorker,
  connectSocket,
  disconnectSocket,
  sendMessage,
  onSocketEvent,
} from "./socket/sharedSocket";
import { token } from "./constant";

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
