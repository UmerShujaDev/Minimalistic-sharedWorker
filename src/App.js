import React, { useEffect, useState } from "react";
import {
  initSharedWorker,
  connectSocket,
  disconnectSocket,
  sendMessage,
  onSocketEvent,
  sendJoinRoom,
  sendPingSignal
} from "./socket/sharedSocket";
import { token } from "./constant";
import { generateUUID } from "./utils";

function App() {
  const [socketState, setSocketState] = useState("disconnected");
  const [socketId, setSocketId] = useState("");

   const handleSocketEvents = (event) => {
    debugger;
    if (event.type === "WSState") {
      const socket_id = event.id || "";
      if(event.state === "connected") {

        sendPingSignal();

        if(localStorage.getItem("UUID") && localStorage.getItem("socket_id") && localStorage.getItem("user_joined")) {
          sendJoinRoom({ room_id: localStorage.getItem("socket_id") });
          setSocketState(event.state);
          setSocketId(localStorage.getItem("socket_id"));
          return;
        } else if(!(localStorage.getItem("socket_id")) && !(localStorage.getItem("user_joined"))) {
          localStorage.setItem("UUID", generateUUID());
          localStorage.setItem("socket_id", socket_id);
          setSocketState(event.state);
          setSocketId(socket_id);
        }
      } else if(event.state === "disconnected") {
        localStorage.removeItem("UUID");
        localStorage.removeItem("socket_id");
        localStorage.removeItem("user_joined")
        setSocketState("disconnected");
        setSocketId(null);
      }
    } else if(event.type === "message") {
      const { user, data } = event.payload; 
      console.log("user, data", user, data);
    } else if(event.type === "scan_result") {
      console.log("🚀 ~ handleSocketEvents ~ event:", event)
    } else if(event.type === "user_joined") {
      localStorage.setItem("user_joined", true)
      console.log("🚀 ~ handleSocketEvents ~ event user joined:", event)
    } else if(event.type === "connect") {
      console.log("🚀 ~ handleSocketEvents ~ event connected:", event)
    }
  };

  useEffect(() => {
    initSharedWorker();
    if (localStorage.getItem("socket_id") && localStorage.getItem("UUID") && localStorage.getItem("user_joined")) {
      connectSocket(token);
    }
    // Listen for socket events
    onSocketEvent(handleSocketEvents);
  }, []);

  return (
    <div style={{ padding: 40 }}>
      <h2>🔗 SharedWorker Socket.IO Demo</h2>
      <p>Status: <strong>{socketState}</strong></p>
      <p>Socket ID: <code>{socketId}</code></p>

      <button onClick={() => {
        connectSocket(token);
      }} disabled={socketState === "connected"}>
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
