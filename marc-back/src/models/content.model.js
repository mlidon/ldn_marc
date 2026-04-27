import { pool } from '../config/db.js';

export async function createContent(data) {
  const sql = `
    INSERT INTO contents (
      content_type,
      title,
      slug,
      short_description,
      cover_image_url,
      content_html,
      status,
      published_at,
      scheduled_at,
      created_by,
      updated_by
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const params = [
    data.content_type,
    data.title,
    data.slug,
    data.short_description,
    data.cover_image_url,
    data.content_html,
    data.status,
    data.published_at,
    data.scheduled_at,
    data.created_by,
    data.updated_by,
  ];

  const [result] = await pool.query(sql, params);
  return result.insertId;
}

export async function getContentById(id) {
  const [rows] = await pool.query(
    'SELECT * FROM contents WHERE id = ? LIMIT 1',
    [id]
  );
  return rows[0] || null;
}

export async function listContents(filters = {}) {
  const conditions = [];
  const values = [];

  if (filters.type) {
    conditions.push('c.content_type = ?');
    values.push(filters.type);
  }

  if (filters.status) {
    conditions.push('c.status = ?');
    values.push(filters.status);
  }

  if (filters.search) {
    conditions.push('(c.title LIKE ? OR c.short_description LIKE ?)');
    values.push(`%${filters.search}%`, `%${filters.search}%`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const sql = `
    SELECT c.*
    FROM contents c
    ${where}
    ORDER BY c.created_at DESC
  `;

  const [rows] = await pool.query(sql, values);
  return rows;
}

export async function updateContentById(id, data) {
  const sql = `
    UPDATE contents
    SET
      content_type = ?,
      title = ?,
      slug = ?,
      short_description = ?,
      cover_image_url = ?,
      content_html = ?,
      status = ?,
      published_at = ?,
      scheduled_at = ?,
      updated_by = ?
    WHERE id = ?
  `;

  const params = [
    data.content_type,
    data.title,
    data.slug,
    data.short_description,
    data.cover_image_url,
    data.content_html,
    data.status,
    data.published_at,
    data.scheduled_at,
    data.updated_by,
    id,
  ];

  const [result] = await pool.query(sql, params);
  return result.affectedRows > 0;
}

export async function deleteContentById(id) {
  const [result] = await pool.query(
    'DELETE FROM contents WHERE id = ?',
    [id]
  );

  return result.affectedRows > 0;
}

export async function getTagsByContentId(contentId) {
  const [rows] = await pool.query(
    `
      SELECT t.id, t.name, t.slug
      FROM content_tags ct
      INNER JOIN tags t ON t.id = ct.tag_id
      WHERE ct.content_id = ?
      ORDER BY t.name ASC
    `,
    [contentId]
  );

  return rows;
}

export async function replaceContentTags(contentId, tagIds = []) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    await connection.query(
      'DELETE FROM content_tags WHERE content_id = ?',
      [contentId]
    );

    if (tagIds.length) {
      const values = tagIds.map((tagId) => [contentId, tagId]);
      await connection.query(
        'INSERT INTO content_tags (content_id, tag_id) VALUES ?',
        [values]
      );
    }

    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export async function getContentBySlug(slug) {
  const [rows] = await pool.query(
    `
      SELECT c.*
      FROM contents c
      WHERE c.slug = ?
      LIMIT 1
    `,
    [slug]
  );

  return rows[0] || null;
}