import { Router } from 'express';
import {
  getTags,
  createTagHandler,
  updateTagHandler,
  deleteTagHandler,
} from '../controllers/tag.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/', getTags);
router.post('/', requireAuth, createTagHandler);
router.put('/:id', requireAuth, updateTagHandler);
router.delete('/:id', requireAuth, deleteTagHandler);

export default router;