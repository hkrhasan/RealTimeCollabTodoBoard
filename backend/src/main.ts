import express from "express";
import cors from "cors";
import config from "./config";
import { registerRoutes } from "./routes";
import { connectDB } from "./db";


const app = express();
app.use(cors()); // Enables CORS for all routes and origins
app.use(express.json());


registerRoutes(app);


async function start() {
  await connectDB()

  app.listen(config.port as number, config.host, () => {
    console.log(`Server running at http://${config.host}:${config.port}/`);
  });
}

start()