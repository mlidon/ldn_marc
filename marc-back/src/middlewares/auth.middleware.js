import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export function requireAuth(req, _res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      const error = new Error('Token no proporcionado');
      error.status = 401;
      throw error;
    }

    const token = authHeader.slice(7);
    const payload = jwt.verify(token, env.jwtSecret);

    req.user = {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    };

    next();
  } catch (error) {
    error.status = 401;
    next(error);
  }
}