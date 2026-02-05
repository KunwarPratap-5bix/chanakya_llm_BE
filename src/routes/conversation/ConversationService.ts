import { Request, Response } from 'express';
import ConversationDao from '../../dao/ConversationDao';
import MessageDao from '../../dao/MessageDao';
import { ChatRole, Status } from '@enums';
import { CommonId, IMessage } from '@schemas';
import { getAiResponse, getOpenAiResponse } from '@utils';
import { AiMessage, AiResponse } from '@dto';

class ConversationService {

    async startConversation(req: Request, res: Response) {
        const user = req.user ? req.user._id : undefined;

        const { firstMessage } = req.body;
        let aiResponseData: AiResponse | null = null;

        let conversationTitle = 'New Conversation';
        if (firstMessage) {
            aiResponseData = await getOpenAiResponse([
                {
                    role: ChatRole.USER,
                    content: `Task:
1. Provide a short, catchy title (max 5 words) for this conversation.
2. Provide your response to the user's message.

Format:
TITLE: <title>
CONTENT: <response content>

User Message: ${firstMessage}`,
                },
            ]);

            if (!aiResponseData || !aiResponseData.data.choices[0]) return res.serverError(null, 'AI Response Error');

            const fullContent = aiResponseData.data.choices[0].message.content || '';
            const titleMatch = fullContent.match(/TITLE:\s*(.*)/i);
            const contentMatch = fullContent.match(/CONTENT:\s*([\s\S]*)/i);

            if (titleMatch && contentMatch && titleMatch[1] && contentMatch[1]) {
                conversationTitle = titleMatch[1].trim();
                aiResponseData.data.choices[0].message.content = contentMatch[1].trim();
            } else if (titleMatch && titleMatch[1]) {
                conversationTitle = titleMatch[1].trim();
                aiResponseData.data.choices[0].message.content = fullContent.replace(/TITLE:.*\n?/i, '').trim();
            }
        }

        if (req.user) {
            const conversation = await ConversationDao.create({
                user,
                title: conversationTitle,
                status: Status.ACTIVE,
            });

            if (firstMessage) {
                await MessageDao.create({
                    conversationId: conversation._id,
                    role: ChatRole.USER,
                    content: firstMessage,
                });

                const choice = aiResponseData?.data?.choices?.[0];
                const usage = aiResponseData?.data?.usage;

                const formattedMessage: IMessage = {
                    conversationId: conversation._id,
                    role: ChatRole.ASSISTANT,
                    content: choice?.message?.content || '',
                    metadata: {
                        model: aiResponseData?.data?.model,
                        tokensIn: usage?.prompt_tokens,
                        tokensOut: usage?.completion_tokens,
                        latencyMs: aiResponseData?.latencyMs,
                    },
                };

                await MessageDao.create(formattedMessage);
            }

            return res.success(conversation, req.__(''));
        }

        if (firstMessage) {
            const choice = aiResponseData?.data?.choices?.[0];
            const usage = aiResponseData?.data?.usage;

            return res.success(
                {
                    title: conversationTitle,
                    response: choice?.message?.content || '',
                    metadata: {
                        model: aiResponseData?.data?.model,
                        tokensIn: usage?.prompt_tokens,
                        tokensOut: usage?.completion_tokens,
                        latencyMs: aiResponseData?.latencyMs,
                    },
                },
                req.__('')
            );
        }

        return res.success({ response: null }, req.__(''));
    }

    async sendMessage(req: Request, res: Response) {
        const { id } = req.params as unknown as CommonId;
        const { message } = req.body;
        const user = req.user._id;

        const conversation = await ConversationDao.getById(id);

        if (!conversation || conversation.user.toString() !== user.toString()) {
            return res.notFound(null, req.__('CONVERSATION_NOT_FOUND'));
        }

        await MessageDao.create({
            conversationId: conversation._id,
            role: ChatRole.USER,
            content: message,
        });

        const totalMessages = await MessageDao.getCountByConversationId(conversation._id);
        const windowSize = 20;
        const recentMessages = await MessageDao.getRecentByConversationId(conversation._id, windowSize);

        let currentSummary = conversation.summary;
        // If the conversation is long (> 50 messages), summarize the part before those 20
        if (totalMessages > 50 && !currentSummary) {
            const olderHistoryCount = totalMessages - windowSize;
            const olderMessages = await MessageDao.getOlderMessages(conversation._id, olderHistoryCount);
            const historyText = olderMessages.map(m => `${m.role}: ${m.content}`).join('\n');

            const summaryResponse = await getOpenAiResponse([
                {
                    role: ChatRole.USER,
                    content: `Please provide a concise but comprehensive summary of the following conversation history. Focus on key topics and decisions made:\n\n${historyText}`,
                },
            ]);

            currentSummary = summaryResponse.data?.choices?.[0]?.message?.content || '';
            await ConversationDao.update({ id, data: { summary: currentSummary } });
        }

        const context: AiMessage[] = [];
        if (currentSummary) {
            context.push({
                role: ChatRole.SYSTEM,
                content: `Here is a summary of the older part of this conversation: ${currentSummary}`,
            });
        }

        recentMessages.forEach(msg => {
            context.push({
                role: msg.role,
                content: msg.content,
            });
        });

        const aiResponse = await getOpenAiResponse(context);

        const choice = aiResponse.data?.choices?.[0];
        const usage = aiResponse.data?.usage;

        const formattedMessage: IMessage = {
            conversationId: conversation._id,
            role: ChatRole.ASSISTANT,
            content: choice?.message?.content || '',
            metadata: {
                model: aiResponse.data?.model,
                tokensIn: usage?.prompt_tokens,
                tokensOut: usage?.completion_tokens,
                latencyMs: aiResponse.latencyMs,
            },
        };

        const savedAiMessage = await MessageDao.create(formattedMessage);

        return res.success(savedAiMessage, req.__(''));
    }

    async getMessages(req: Request, res: Response) {
        const { id } = req.params as unknown as CommonId;
        const page = parseInt(req.query.page as string) || 1;
        const perPage = parseInt(req.query.perPage as string) || 20;

        if (!id) return res.badRequest(null, 'conversationId is required');

        const conversation = await ConversationDao.getById(id);

        if (!conversation) return res.notFound(null, req.__('CONVERSATION_NOT_FOUND'));

        const { data: messages, total } = await MessageDao.getAndCount({
            conversationId: id,
            page,
            perPage,
        });
        return res.success(
            {
                messages,
                pagination: {
                    total,
                    page,
                    perPage,
                    pages: Math.ceil(total / perPage),
                },
            },
            req.__('')
        );
    }

    async getConversations(req: Request, res: Response) {
        const user = req.user._id;

        const conversations = await ConversationDao.getByUserId(user);

        return res.success(conversations, req.__(''));
    }

    async deleteConversation(req: Request, res: Response) {
        const { id } = req.params as unknown as CommonId;

        await ConversationDao.update({ id, data: { status: Status.ARCHIVED } });

        return res.success(null, req.__(''));
    }

    async updateConversation(req: Request, res: Response) {
        const { id } = req.params as unknown as CommonId;

        const { title, isPinned } = req.body;

        if (title) {
            const conversation = await ConversationDao.getById(id);

            if (!conversation) return res.notFound(null, req.__('CONVERSATION_NOT_FOUND'));

            await ConversationDao.update({
                id,
                data: { title },
            });
        }

        if (isPinned) {
            const conversation = await ConversationDao.getById(id);

            if (!conversation) return res.notFound(null, req.__('CONVERSATION_NOT_FOUND'));

            await ConversationDao.update({
                id,
                data: { isPinned },
            });
        }

        return res.success(null, req.__(''));
    }
}

export default new ConversationService();
