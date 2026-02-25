import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
    getConversations,
    getMessages,
    startConversation,
    sendMessage,
    markAsRead
} from '../controllers/chatController';

const router = Router();

router.use(authenticate);

router.get('/', getConversations);
router.get('/:id', getMessages);
router.post('/', startConversation);
router.post('/:id/messages', sendMessage);
router.post('/:id/read', markAsRead);

export default router;
