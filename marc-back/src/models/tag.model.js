import { pool } from '../config/db.js';

export async function listTags() {
  const [rows] = await pool.query(
    'SELECT id, name, slug, created_at FROM tags ORDER BY name ASC'
  );
  return rows;
}

export async function createTag(data) {
  const [result] = await pool.query(
    `
      INSERT INTO tags (name, slug)
      VALUES (?, ?)
    `,
    [data.name, data.slug]
  );

  return result.insertId;
}

export async function getTagById(id) {
  const [rows] = await pool.query(
    `
      SELECT id, name, slug, created_at
      FROM tags
      WHERE id = ?
      LIMIT 1
    `,
    [id]
  );

  return rows[0] || null;
}

export async function updateTagById(id, data) {
  const [result] = await pool.query(
    `
      UPDATE tags
      SET name = ?, slug = ?
      WHERE id = ?
    `,
    [data.name, data.slug, id]
  );

  return result.affectedRows > 0;
}

export async function deleteTagById(id) {
  const [result] = await pool.query(
    'DELETE FROM tags WHERE id = ?',
    [id]
  );

  return result.affectedRows > 0;
}