import dotenv from "dotenv";

dotenv.config();

const config = {
  port: process.env.PORT || 4000,
  host: process.env.HOST || "localhost",
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:3000",
  mongoUri: process.env.MONGO_URI || ''
};


if (!config.mongoUri) throw new Error('MONGODB_URI missing in .env');

export default config;