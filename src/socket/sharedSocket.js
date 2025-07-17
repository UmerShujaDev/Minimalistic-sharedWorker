let worker = null;
const listeners = [];

export function initSharedWorker() {
  if (!worker) {
    console.log("🧠 Initializing shared worker...");
    worker = new SharedWorker("/sharedWorker.js");
    worker.port.start();

    worker.port.onmessage = (event) => {
      const data = event.data;
        debugger;

        if (data.type === "WSState") {
            // Update connection status in UI
            listeners.forEach((cb) => cb({ type: "WSState", state: data.state, id: data.socketId }));
        }

        if (data.type === "message") {
            listeners.forEach((cb) => cb(data));
        }
    };
  }
}

export function connectSocket(token) {
  if (worker) {
    console.log("🔗 Connecting socket with token:", token);
    worker.port.postMessage({ type: "connect", payload: { token } });
  }
}

export function disconnectSocket() {
  if (worker) {
    console.log("🚫 Disconnecting socket...");
    worker.port.postMessage({ type: "disconnect" });
  }
}

export function sendMessage(message) {
  if (worker) {
    worker.port.postMessage({ type: "sendMessage", payload: message });
  }
}

export function onSocketEvent(callback) {
  listeners.push(callback);
}
