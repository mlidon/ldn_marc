import {
  createContent,
  getContentById,
  getContentBySlug,
  listContents,
  updateContentById,
  deleteContentById,
  getTagsByContentId,
  replaceContentTags,
} from '../models/content.model.js';
import { slugify } from '../utils/slugify.js';

function resolveStatusDates(payload, currentContent = null) {
  const status = payload.status || currentContent?.status || 'draft';

  let publishedAt = currentContent?.published_at || null;
  let scheduledAt = payload.scheduled_at ?? currentContent?.scheduled_at ?? null;

  if (status === 'draft') {
    publishedAt = null;
    scheduledAt = null;
  }

  if (status === 'published') {
    publishedAt = currentContent?.published_at || new Date();
    scheduledAt = null;
  }

  if (status === 'scheduled') {
    if (!scheduledAt) {
      const error = new Error('scheduled_at es obligatorio cuando el estado es scheduled');
      error.status = 400;
      throw error;
    }
    publishedAt = null;
  }

  return {
    status,
    publishedAt,
    scheduledAt,
  };
}

async function attachTags(content) {
  if (!content) {
    return null;
  }

  const tags = await getTagsByContentId(content.id);
  return {
    ...content,
    tags,
  };
}

export async function createContentService(payload, userId) {
  const { status, publishedAt, scheduledAt } = resolveStatusDates(payload);

  const data = {
    content_type: payload.content_type,
    title: payload.title,
    slug: slugify(payload.title),
    short_description: payload.short_description,
    cover_image_url: payload.cover_image_url,
    content_html: payload.content_html || '',
    status,
    published_at: publishedAt,
    scheduled_at: scheduledAt,
    created_by: userId,
    updated_by: userId,
  };

  const contentId = await createContent(data);

  if (Array.isArray(payload.tag_ids) && payload.tag_ids.length) {
    await replaceContentTags(contentId, payload.tag_ids);
  }

  const content = await getContentById(contentId);
  return attachTags(content);
}

export async function listContentsService(filters) {
  const items = await listContents(filters);

  const withTags = await Promise.all(
    items.map(async (item) => {
      const tags = await getTagsByContentId(item.id);
      return { ...item, tags };
    })
  );

  return withTags;
}

export async function getContentByIdService(id) {
  const content = await getContentById(id);
  return attachTags(content);
}

export async function getContentBySlugService(slug) {
  const content = await getContentBySlug(slug);
  return attachTags(content);
}

export async function updateContentService(id, payload, userId) {
  const existing = await getContentById(id);

  if (!existing) {
    const error = new Error('Contenido no encontrado');
    error.status = 404;
    throw error;
  }

  const { status, publishedAt, scheduledAt } = resolveStatusDates(payload, existing);

  const data = {
    content_type: payload.content_type ?? existing.content_type,
    title: payload.title ?? existing.title,
    slug: payload.title ? slugify(payload.title) : existing.slug,
    short_description: payload.short_description ?? existing.short_description,
    cover_image_url: payload.cover_image_url ?? existing.cover_image_url,
    content_html: payload.content_html ?? existing.content_html,
    status,
    published_at: publishedAt,
    scheduled_at: scheduledAt,
    updated_by: userId,
  };

  await updateContentById(id, data);

  if (Array.isArray(payload.tag_ids)) {
    await replaceContentTags(id, payload.tag_ids);
  }

  const updated = await getContentById(id);
  return attachTags(updated);
}

export async function deleteContentService(id) {
  const deleted = await deleteContentById(id);

  if (!deleted) {
    const error = new Error('Contenido no encontrado');
    error.status = 404;
    throw error;
  }

  return true;
}