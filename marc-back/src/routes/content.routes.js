import { Router } from 'express';
import {
  createContent,
  getContents,
  getContentById,
  getContentBySlug,
  updateContent,
  deleteContent,
} from '../controllers/content.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/', getContents);
router.get('/slug/:slug', getContentBySlug);
router.get('/:id', getContentById);

router.post('/', requireAuth, createContent);
router.put('/:id', requireAuth, updateContent);
router.delete('/:id', requireAuth, deleteContent);

export default router;