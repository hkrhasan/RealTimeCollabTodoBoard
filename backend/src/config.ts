import dotenv from "dotenv";

dotenv.config();

const config = {
  port: process.env.PORT || 4000,
  host: process.env.HOST || "localhost",
  mongoUri: process.env.MONGO_URI || ''
};


if (!config.mongoUri) throw new Error('MONGODB_URI missing in .env');

export default config;