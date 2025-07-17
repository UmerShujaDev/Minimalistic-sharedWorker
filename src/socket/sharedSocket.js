let worker;
const listeners = [];

export function initSharedSocket() {
  if (!worker) {
    console.log("🧵 Creating SharedWorker");
    worker = new SharedWorker("/sharedWorker.js");
    worker.port.start();

    worker.port.onmessage = (event) => {
      console.log("📥 Received from worker:", event.data);
      listeners.forEach((cb) => cb(event.data));
    };
  }
}

export function connectSocket(token) {
  console.log("🚀 Asking worker to connect socket with token:", token);
  worker?.port.postMessage({ type: "connect_socket", token });
}

export function sendMessage(payload) {
  console.log("✉️ Sending message to worker:", payload);
  worker?.port.postMessage({ type: "send", payload });
}

export function onSocketEvent(cb) {
  listeners.push(cb);
}
