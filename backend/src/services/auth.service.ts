import { JWTPayload } from "../types/jwt-payload";
import jwt, { SignOptions } from 'jsonwebtoken';
import config from '../config'
import userRepository from "../repositories/user.repository";

class AuthService {
  async signTokens(payload: JWTPayload): Promise<{ accessToken: string, refreshToken: string }> {
    try {
      const accessToken = jwt.sign(payload, config.JWTSecret, {
        expiresIn: config.accessExpire as SignOptions["expiresIn"]
      });

      const refreshToken = jwt.sign(payload, config.JWTSecret, {
        expiresIn: config.refreshExpire as SignOptions["expiresIn"]
      });

      await userRepository.update(payload.sub, {
        rtHash: refreshToken
      })

      return { accessToken, refreshToken };
    } catch (error) {
      throw new Error(`Token generation failed: ${(error as Error).message}`);
    }
  }

  verifyToken(token: string): JWTPayload {
    try {
      const payload = jwt.verify(token, config.JWTSecret);
      if (typeof payload === "object" && payload !== null) {
        return payload as JWTPayload;
      }
      throw new Error("Invalid token payload type");
    } catch (error) {
      throw new Error(`Token verification failed: ${(error as Error).message}`);
    }
  }
}


export default new AuthService();