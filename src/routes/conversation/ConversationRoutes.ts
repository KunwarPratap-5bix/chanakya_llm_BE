import { RequestHandler, Router } from 'express';
import ConversationService from './ConversationService';
import ConversationValidations from './ConversationValidations';
import { verifyToken } from '../../utils/auth';
import { validate } from '../../utils/validations';

const router = Router();

// Start a new conversation
router.post(
    '/start',
    verifyToken(),
    validate(ConversationValidations.startConversation),
    ConversationService.startConversation as RequestHandler
);

// Get all conversations of the logged-in user
router.get('/list', verifyToken(), ConversationService.getConversations as RequestHandler);

// Get all messages of a specific conversation
router.get(
    '/:id/messages',
    verifyToken(),
    validate(ConversationValidations.conversationIdParam, 'params'),
    ConversationService.getMessages as RequestHandler
);

// Send a message to an existing conversation
router.post(
    '/:id/message',
    verifyToken(),
    validate(ConversationValidations.conversationIdParam, 'params'),
    validate(ConversationValidations.sendMessage),
    ConversationService.sendMessage as RequestHandler
);

// Soft delete a conversation
router.delete(
    '/:id',
    verifyToken(),
    validate(ConversationValidations.conversationIdParam, 'params'),
    ConversationService.deleteConversation as RequestHandler
);

// Rename a conversation
router.patch(
    '/:id/rename',
    verifyToken(),
    validate(ConversationValidations.conversationIdParam, 'params'),
    validate(ConversationValidations.renameConversation),
    ConversationService.renameConversation as RequestHandler
);

export { router };
