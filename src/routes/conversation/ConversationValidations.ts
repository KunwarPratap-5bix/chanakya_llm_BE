import { commonValidations, joi } from '@utils';

const startConversation = joi.object().keys({
    title: joi.string().trim().optional(),
    firstMessage: joi.string().trim().optional(),
});

const renameConversation = joi.object().keys({
    title: joi.string().trim().required(),
});

const conversationIdParam = joi.object().keys({
    id: commonValidations.id.required(),
});

const sendMessage = joi.object().keys({
    message: joi.string().trim().required(),
});

export default {
    startConversation,
    renameConversation,
    conversationIdParam,
    sendMessage,
};
