import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { getBookmarks, addBookmark, removeBookmark } from '../controllers/bookmarksController';

const router = Router();

router.get('/', authenticate, getBookmarks);
router.post('/:listingId', authenticate, addBookmark);
router.delete('/:listingId', authenticate, removeBookmark);

export default router;
