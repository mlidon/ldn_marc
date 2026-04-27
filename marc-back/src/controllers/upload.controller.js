import { ok, fail } from '../utils/api-response.js';

export async function uploadCoverImage(req, res, next) {
  try {
    if (!req.file) {
      fail('No se ha recibido ninguna imagen', 400);
    }

    const relativePath = `/uploads/covers/${req.file.filename}`;

    return ok(
      res,
      {
        fileName: req.file.filename,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        url: relativePath,
      },
      'Imagen subida correctamente',
      201
    );
  } catch (error) {
    next(error);
  }
}

export async function uploadAttachment(req, res, next) {
  try {
    if (!req.file) {
      fail('No se ha recibido ningún archivo', 400);
    }

    const relativePath = `/uploads/files/${req.file.filename}`;

    return ok(
      res,
      {
        fileName: req.file.filename,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        url: relativePath,
      },
      'Archivo subido correctamente',
      201
    );
  } catch (error) {
    next(error);
  }
}