import { comparePassword, generateToken } from '../services/auth.service.js';
import { findUserByEmail } from '../models/user.model.js';
import { ok, fail } from '../utils/api-response.js';

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      fail('Email y password son obligatorios', 400);
    }

    const user = await findUserByEmail(email);

    if (!user || !user.is_active) {
      fail('Credenciales inválidas', 401);
    }

    const validPassword = await comparePassword(password, user.password_hash);

    if (!validPassword) {
      fail('Credenciales inválidas', 401);
    }

    const token = generateToken(user);

    return ok(res, {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    }, 'Login correcto');
  } catch (error) {
    next(error);
  }
}