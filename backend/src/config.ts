import dotenv from "dotenv";

dotenv.config();

const config = {
  port: process.env.PORT || 4000,
  host: process.env.HOST || "localhost",
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:3000",
  mongoUri: process.env.MONGO_URI || '',
  JWTSecret: process.env.JWT_SECRET || 'super-secret-key',
  accessExpire: '15m',
  refreshExpire: '7d'
};




if (!config.mongoUri) throw new Error('MONGODB_URI missing in .env');
if (!config.JWTSecret) throw new Error('JWT_SECRET missing in .env')

export default config;