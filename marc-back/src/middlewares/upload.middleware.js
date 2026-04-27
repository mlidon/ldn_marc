import multer from 'multer';
import fs from 'node:fs';
import path from 'node:path';
import { env } from '../config/env.js';

const coversDir = path.join(process.cwd(), env.uploadDir, 'covers');
const filesDir = path.join(process.cwd(), env.uploadDir, 'files');

fs.mkdirSync(coversDir, { recursive: true });
fs.mkdirSync(filesDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, file, cb) => {
    if (file.fieldname === 'cover') {
      cb(null, coversDir);
      return;
    }

    cb(null, filesDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path
      .basename(file.originalname, ext)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    cb(null, `${Date.now()}-${base}${ext}`);
  },
});

function fileFilter(_req, file, cb) {
  if (file.fieldname === 'cover') {
    if (!file.mimetype.startsWith('image/')) {
      cb(new Error('La portada debe ser una imagen'));
      return;
    }
  }

  cb(null, true);
}

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});