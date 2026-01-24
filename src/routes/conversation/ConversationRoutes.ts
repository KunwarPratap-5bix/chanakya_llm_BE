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
    '/:id/rename',
    verifyToken(),
    validate(ConversationValidations.conversationIdParam, 'params'),
    validate(ConversationValidations.renameConversation),
    ConversationService.renameConversation as RequestHandler
);

export { router };
