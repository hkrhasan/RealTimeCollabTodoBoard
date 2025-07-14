import express from "express";
import http from "http";
import cors from "cors";
import { Server } from 'socket.io';
import config from "./config";
import { registerRoutes } from "./routes";
import { connectDB } from "./db";
import { httpContextMiddleware } from "./middlewares/http-context.middleware";
import { authenticateSocket } from "./middlewares/auth.middleware";

const app = express();
app.use(cors()); // Enables CORS for all routes and origins
app.use(httpContextMiddleware);
app.use(express.json());
registerRoutes(app);


async function start() {
  await connectDB();

  const server = http.createServer(app);

  const io = new Server(server, {
    cors: {
      origin: config.corsOrigin || "*", // Allow all origins or specify a specific origin
      methods: ["GET", "POST"],
      allowedHeaders: ["Content-Type"],
      credentials: true,
    },
  });

  io.use(authenticateSocket())

  io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Handle socket events here
    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });

  server.listen(config.port as number, config.host, () => {
    console.log(`Server running at http://${config.host}:${config.port}/`);
  });
}

start()