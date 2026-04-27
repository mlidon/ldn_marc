import { ok, fail } from '../utils/api-response.js';
import {
  createContentService,
  listContentsService,
  getContentByIdService,
  getContentBySlugService,
  updateContentService,
  deleteContentService,
} from '../services/content.service.js';

export async function createContent(req, res, next) {
  try {
    const {
      content_type,
      title,
      short_description,
      cover_image_url,
    } = req.body;

    if (!content_type || !['post', 'project'].includes(content_type)) {
      fail('content_type debe ser post o project', 400);
    }

    if (!title || !short_description || !cover_image_url) {
      fail('title, short_description y cover_image_url son obligatorios', 400);
    }

    const content = await createContentService(req.body, req.user.id);
    return ok(res, content, 'Contenido creado correctamente', 201);
  } catch (error) {
    next(error);
  }
}

export async function getContents(req, res, next) {
  try {
    const data = await listContentsService({
      type: req.query.type,
      status: req.query.status,
      search: req.query.search,
    });

    return ok(res, data);
  } catch (error) {
    next(error);
  }
}

export async function getContentById(req, res, next) {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      fail('ID inválido', 400);
    }

    const content = await getContentByIdService(id);

    if (!content) {
      fail('Contenido no encontrado', 404);
    }

    return ok(res, content);
  } catch (error) {
    next(error);
  }
}

export async function getContentBySlug(req, res, next) {
  try {
    const content = await getContentBySlugService(req.params.slug);

    if (!content) {
      fail('Contenido no encontrado', 404);
    }

    return ok(res, content);
  } catch (error) {
    next(error);
  }
}

export async function updateContent(req, res, next) {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      fail('ID inválido', 400);
    }

    const content = await updateContentService(id, req.body, req.user.id);

    return ok(res, content, 'Contenido actualizado correctamente');
  } catch (error) {
    next(error);
  }
}

export async function deleteContent(req, res, next) {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      fail('ID inválido', 400);
    }

    await deleteContentService(id);
    return ok(res, null, 'Contenido eliminado correctamente');
  } catch (error) {
    next(error);
  }
}