import { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from 'socket.io-client';


type SocketContextType = {
  socket: Socket | null;
  isConnected: boolean;
};

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
});
export const useSocket = () => useContext(SocketContext);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const newSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:4000', {
      reconnectionAttempts: 5, // Retry connection attempts
      auth: {
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InVzZXI1QHRvZG9ib2FyZC5jb20iLCJzdWIiOiI2ODc0NDVkYTE2MGIxNmM4MDRjYzBhYjMiLCJpYXQiOjE3NTI0ODYzODQsImV4cCI6MTc1MjQ4NzI4NH0.18qdkVCcabvpxFlTSsrvtiUdRqXYjhWLwbBgnoEMwfE'
      }
    });

    newSocket.on("connect", () => {
      setIsConnected(true);
      console.log("Socket connected:", newSocket.id); // Log the socket ID for debugging
    });

    newSocket.on("disconnect", () => {
      setIsConnected(false);
      console.log("Socket disconnected:", newSocket.id); // Log the socket ID for debugging
    });

    newSocket.on("messge", (msg: string) => {
      console.log("Received message:", msg);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={{
      socket,
      isConnected,
    }}>
      {children}
    </SocketContext.Provider>
  );
};