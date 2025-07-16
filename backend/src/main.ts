import express from "express";
import http from "http";
import cors from "cors";
import { Server } from 'socket.io';
import config from "./config";
import { registerRoutes } from "./routes";
import { connectDB } from "./db";
import { httpContextMiddleware } from "./middlewares/http-context.middleware";
import { authenticateSocket } from "./middlewares/auth.middleware";
import { initializeSocket } from "./socket";

const app = express();
app.use(cors()); // Enables CORS for all routes and origins
app.use(httpContextMiddleware);
app.use(express.json());
registerRoutes(app);

async function start() {
  await connectDB();
  const server = http.createServer(app);
  initializeSocket(server);

  server.listen(config.port as number, config.host, () => {
    console.log(`Server running at http://${config.host}:${config.port}/`);
  });
}

start()