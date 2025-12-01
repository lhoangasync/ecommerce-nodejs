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
          return;
        }

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
          setIsConnected(true);
        });

        socket.on("connect_error", (err) => {
          setIsConnected(false);
        });

        socket.on("disconnect", (reason) => {
          setIsConnected(false);
        });

        socketRef.current = socket;
      } catch (err) {
      }
    };

    connectSocket();

    return () => {
      mounted = false;
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []); // Chỉ chạy 1 lần khi mount

  return { socket: socketRef.current, isConnected };
};
