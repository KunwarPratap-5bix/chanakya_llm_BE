import axios from 'axios';
import { logger } from './logger';
import { AiMessage, AiResponse } from '@lib/dto/types/conversation.type';

export const getAiResponse = async (messages: AiMessage[]): Promise<AiResponse> => {
    const start = Date.now();
    const models = [
        process.env.GEMINI_AI_MODEL || 'gemini-2.5-flash',
        'gemini-2.5-pro',
        'gemini-2.0-flash',
        'gemini-2.0-flash-001',
        'gemini-2.5-flash-lite',
        'gemini-2.0-flash-lite',
        'gemini-2.0-flash-lite-001',
    ].filter((v, i, a) => v && a.indexOf(v) === i);
    for (let i = 0; i < models.length; i++) {
        const currentModel = models[i];
        try {
            const GEMINI_API = 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions';

            const response = await axios.post(
                GEMINI_API,
                {
                    model: currentModel,
                    messages: messages.map(msg => ({
                        role: msg.role || 'user',
                        content: msg.content,
                    })),
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${process.env.GEMINI_AI_API_KEY}`,
                    },
                }
            );

            return {
                data: response.data,
                latencyMs: Date.now() - start,
            };
        } catch (error: any) {
            const status = error.response?.status;
            if ((status === 429 || status === 404) && i < models.length - 1) {
                logger.warn(`Model ${currentModel} rate limited or not found. Trying next model: ${models[i + 1]}`);
                continue;
            }
            throw error;
        }
    }
    throw new Error('No AI models available');
};

export const getOpenAiResponse = async (messages: AiMessage[]): Promise<AiResponse> => {
    const start = Date.now();
    const models = [
        process.env.OPENAI_AI_MODEL || 'gpt-4o',
        'gpt-4o-mini',
        'gpt-4-turbo',
        'gpt-4',
        'gpt-3.5-turbo',
    ].filter((v, i, a) => v && a.indexOf(v) === i);

    for (let i = 0; i < models.length; i++) {
        const currentModel = models[i];
        try {
            const OPENAI_API = 'https://api.openai.com/v1/chat/completions';

            const response = await axios.post(
                OPENAI_API,
                {
                    model: currentModel,
                    messages: messages.map(msg => ({
                        role: msg.role || 'user',
                        content: msg.content,
                    })),
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
                    },
                }
            );

            return {
                data: response.data,
                latencyMs: Date.now() - start,
            };
        } catch (error: any) {
            const status = error.response?.status;
            if ((status === 429 || status === 404) && i < models.length - 1) {
                logger.warn(
                    `OpenAI Model ${currentModel} rate limited or not found. Trying next model: ${models[i + 1]}`
                );
                continue;
            }
            throw error;
        }
    }
    throw new Error('No OpenAI models available');
};
