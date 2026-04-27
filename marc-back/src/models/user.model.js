import { pool } from '../config/db.js';

export async function findUserByEmail(email) {
  const [rows] = await pool.query(
    `
      SELECT id, name, email, password_hash, role, is_active, created_at, updated_at
      FROM users
      WHERE email = ?
      LIMIT 1
    `,
    [email]
  );

  return rows[0] || null;
}

export async function findUserById(id) {
  const [rows] = await pool.query(
    `
      SELECT id, name, email, role, is_active, created_at, updated_at
      FROM users
      WHERE id = ?
      LIMIT 1
    `,
    [id]
  );

  return rows[0] || null;
}