"use client";

import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { getAccessToken } from "@/lib/axios";

export const useSocket = () => {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    let mounted = true;

    const connectSocket = () => {
      try {
        // Lấy token trực tiếp từ memory
        const token = getAccessToken();

        if (!token) {
          console.warn("⚠️ No access token - user not logged in");
          return;
        }

        console.log("🔌 Connecting socket with token...");
        const socketUrl =
          process.env.NEXT_PUBLIC_API_BASE_URL?.replace("/api", "") ||
          "http://localhost:4000";

        const socket = io(socketUrl, {
          auth: { token },
          transports: ["websocket", "polling"],
          reconnection: true,
          reconnectionDelay: 1000,
          reconnectionAttempts: 5,
        });

        socket.on("connect", () => {
          console.log("✅ Socket connected:", socket.id);
          setIsConnected(true);
        });

        socket.on("connect_error", (err) => {
          console.error("❌ Connection error:", err.message);
          setIsConnected(false);
        });

        socket.on("disconnect", (reason) => {
          console.log("⚠️ Disconnected:", reason);
          setIsConnected(false);
        });

        socketRef.current = socket;
      } catch (err) {
        console.error("❌ Socket init failed:", err);
      }
    };

    connectSocket();

    return () => {
      mounted = false;
      if (socketRef.current) {
        console.log("🔌 Disconnecting socket...");
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []); // Chỉ chạy 1 lần khi mount

  return { socket: socketRef.current, isConnected };
};
