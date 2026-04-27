import { ok, fail } from '../utils/api-response.js';
import {
  listTags,
  createTag,
  getTagById,
  updateTagById,
  deleteTagById,
} from '../models/tag.model.js';
import { slugify } from '../utils/slugify.js';

export async function getTags(_req, res, next) {
  try {
    const rows = await listTags();
    return ok(res, rows);
  } catch (error) {
    next(error);
  }
}

export async function createTagHandler(req, res, next) {
  try {
    const { name } = req.body;

    if (!name) {
      fail('name es obligatorio', 400);
    }

    const id = await createTag({
      name: name.trim(),
      slug: slugify(name),
    });

    const tag = await getTagById(id);
    return ok(res, tag, 'Etiqueta creada correctamente', 201);
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      error.status = 409;
      error.message = 'Ya existe una etiqueta con ese nombre o slug';
    }
    next(error);
  }
}

export async function updateTagHandler(req, res, next) {
  try {
    const { name } = req.body;

    if (!name) {
      fail('name es obligatorio', 400);
    }

    const updated = await updateTagById(Number(req.params.id), {
      name: name.trim(),
      slug: slugify(name),
    });

    if (!updated) {
      fail('Etiqueta no encontrada', 404);
    }

    const tag = await getTagById(Number(req.params.id));
    return ok(res, tag, 'Etiqueta actualizada correctamente');
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      error.status = 409;
      error.message = 'Ya existe una etiqueta con ese nombre o slug';
    }
    next(error);
  }
}

export async function deleteTagHandler(req, res, next) {
  try {
    const deleted = await deleteTagById(Number(req.params.id));

    if (!deleted) {
      fail('Etiqueta no encontrada', 404);
    }

    return ok(res, null, 'Etiqueta eliminada correctamente');
  } catch (error) {
    next(error);
  }
}