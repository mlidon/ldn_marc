import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { upload } from '../middlewares/upload.middleware.js';
import { uploadCoverImage, uploadAttachment } from '../controllers/upload.controller.js';

const router = Router();

router.post('/cover', requireAuth, upload.single('cover'), uploadCoverImage);
router.post('/file', requireAuth, upload.single('file'), uploadAttachment);

export default router;