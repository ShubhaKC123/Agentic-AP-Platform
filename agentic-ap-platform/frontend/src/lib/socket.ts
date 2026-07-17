import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    const envUrl = import.meta.env.VITE_SOCKET_URL;
    const url =
      envUrl && envUrl.length > 0
        ? envUrl
        : typeof window !== "undefined"
          ? window.location.origin
          : "http://localhost:4000";
    socket = io(url, {
      autoConnect: true,
      transports: ["websocket", "polling"],
    });
  }
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
