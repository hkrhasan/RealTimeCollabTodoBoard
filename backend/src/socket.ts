import http from "http";
import { Server } from 'socket.io';
import config from "./config";
import { authenticateSocket } from "./middlewares/auth.middleware";
import { registerHandlers } from "./handlers";


export function initializeSocket(server: http.Server<typeof http.IncomingMessage, typeof http.ServerResponse>) {

  // initialize socket
  const io = new Server(server, {
    cors: {
      origin: config.corsOrigin || "*", // Allow all origins or specify a specific origin
      methods: ["GET", "POST"],
      allowedHeaders: ["Content-Type"],
      credentials: true,
    },
  });

  // handle auth
  io.use(authenticateSocket())


  io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Handle socket events here
    registerHandlers(socket);

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });

  // Error handling middleware
  io.engine.on('connection_error', (err) => {
    console.log(`Socket connection error: ${err.message}`);
  });
}

