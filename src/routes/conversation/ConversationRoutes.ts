import { RequestHandler, Router } from 'express';
import ConversationService from './ConversationService';
import ConversationValidations from './ConversationValidations';
import { verifyToken } from '../../utils/auth';
import { validate } from '../../utils/validations';

const router = Router();

router.post(
    '/start',
    verifyToken(undefined, true),
    validate(ConversationValidations.startConversation),
    ConversationService.startConversation as RequestHandler
);

router.get('/list', verifyToken(), ConversationService.getConversations as RequestHandler);

router.get(
    '/:id/messages',
    verifyToken(),
    validate(ConversationValidations.conversationIdParam, 'params'),
    validate(ConversationValidations.paginationQuery, 'query'),
    ConversationService.getMessages as RequestHandler
);

router.post(
    '/:id/message',
    verifyToken(),
    validate(ConversationValidations.conversationIdParam, 'params'),
    validate(ConversationValidations.sendMessage),
    ConversationService.sendMessage as RequestHandler
);

router.delete(
    '/:id',
    verifyToken(),
    validate(ConversationValidations.conversationIdParam, 'params'),
    ConversationService.deleteConversation as RequestHandler
);

router.patch(
    '/:id/update',
    verifyToken(),
    validate(ConversationValidations.conversationIdParam, 'params'),
    validate(ConversationValidations.updateConversation),
    ConversationService.updateConversation as RequestHandler
);

router.post(
    '/:id/retry',
    verifyToken(),
    validate(ConversationValidations.conversationIdParam, 'params'),
    ConversationService.retryConversation as RequestHandler
);

export { router };
