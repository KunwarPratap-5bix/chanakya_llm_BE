import { commonValidations, joi } from '@utils';

const startConversation = joi.object().keys({
    firstMessage: joi.string().trim().optional(),
});

const updateConversation = joi.object().keys({
    title: joi.string().trim().optional(),
    isPinned: joi.boolean().optional(),
});

const conversationIdParam = joi.object().keys({
    id: commonValidations.id.required(),
});

const sendMessage = joi.object().keys({
    message: joi.string().trim().required(),
});

const paginationQuery = joi.object().keys({
    page: joi.number().integer().min(1).optional(),
    perPage: joi.number().integer().min(1).max(100).optional(),
});

export default {
    startConversation,
    updateConversation,
    conversationIdParam,
    sendMessage,
    paginationQuery,
};
