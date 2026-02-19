import axios from 'axios';
import { logger } from './logger';
import { AiContent, AiMessage, AiResponse } from '@lib/dto/types/conversation.type';

export const checkModeration = async (text: string): Promise<{ flagged: boolean; reason?: string }> => {
    if (!text || typeof text !== 'string') return { flagged: false };

    // Layer 1: Aggressive Keyword Filter (Instant/Zero Latency)
    const criticalKeywords = [
        'bdsm',
        'porn',
        'sex',
        'sexual',
        'fetish',
        'erotica',
        'nude',
        'naked',
        'kink',
        'dominant',
        'submissive',
        'bondage',
        'xxx',
        'adult content',
        'hardcore',
        'softcore',
        'lingerie',
        'sculpting',
        'pleasure',
        'arousal',
        'masturbate',
        'orgasm',
        'climax',
        'intercourse',
        'sensual',
        'erotic',
        'voyeur',
        'swingers',
        'threesome',
        'gangbang',
        'fetishism',
        'hentai',
        'incest',
        'bestiality',
        'pedophilia',
        'rape',
        'assault',
        'molestation',
        'camgirl',
        'camboy',
        'escort',
        'prostitution',
        'sugar baby',
        'sugar daddy',
    ];
    const normalizedText = text.toLowerCase();
    if (criticalKeywords.some(kw => normalizedText.includes(kw))) {
        return { flagged: true, reason: 'Adult/Explicit keywords detected' };
    }

    // Layer 2: OpenAI Standard Moderation
    try {
        const response = await axios.post(
            'https://api.openai.com/v1/moderations',
            { input: text },
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
                },
            }
        );
        const result = response.data.results[0];
        if (result.flagged) {
            const categories = Object.entries(result.categories)
                .filter(([, isFlagged]) => isFlagged === true)
                .map(([category]) => category)
                .join(', ');
            return { flagged: true, reason: categories };
        }
    } catch (error: unknown) {
        logger.error('Moderation API call failed:', error instanceof Error ? error.message : String(error));
    }

    // Layer 3: Secondary Safety Judge (For nuance/slang/circumvention)
    try {
        const judgeResponse = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
                model: 'gpt-4o-mini',
                messages: [
                    {
                        role: 'system',
                        content:
                            'You are a strict safety judge. Your only job is to detect if a message contains adult content, sexual lifestyle topics, or sexually suggestive material. Answer ONLY "YES" if it is unsafe/adult, or "NO" if it is safe. Be extremely strict.',
                    },
                    { role: 'user', content: text },
                ],
                max_tokens: 5,
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
                },
            }
        );
        const decision = judgeResponse.data.choices[0]?.message?.content?.toUpperCase();
        if (decision?.includes('YES')) {
            return { flagged: true, reason: 'LLM Judge flagged as adult/inappropriate' };
        }
    } catch (error: unknown) {
        logger.error('Safety Judge call failed:', error instanceof Error ? error.message : String(error));
    }

    return { flagged: false };
};

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

    // Check Input Moderation
    for (const msg of messages) {
        const textToCheck =
            typeof msg.content === 'string' ? msg.content : msg.content.map((c: AiContent) => c.text).join(' ');
        const moderation = await checkModeration(textToCheck);
        if (moderation.flagged) {
            return {
                data: {
                    choices: [
                        {
                            message: {
                                content: `I'm sorry, but I can't fulfill this request. It appears to violate safety policies regarding inappropriate or offensive content. Is there anything else I can help you with?`,
                                role: 'assistant',
                            },
                            index: 0,
                            finish_reason: 'content_filter',
                        },
                    ],
                    model: models[0],
                },
                latencyMs: Date.now() - start,
                isBlocked: true,
                blockedReason: moderation.reason,
            } as AiResponse;
        }
    }

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

            const aiResponse: AiResponse = {
                data: response.data,
                latencyMs: Date.now() - start,
            };

            // Check Output Moderation
            const outputText = aiResponse.data.choices[0]?.message?.content || '';
            const outputModeration = await checkModeration(outputText);
            if (outputModeration.flagged) {
                if (aiResponse.data.choices[0]) {
                    aiResponse.data.choices[0].message.content =
                        `I'm sorry, I cannot fulfill this request. My safety guidelines prohibit me from generating content of this nature. Please let me know if there's anything else you'd like to discuss!`;
                }
                aiResponse.isBlocked = true;
                aiResponse.blockedReason = outputModeration.reason;
            }

            return aiResponse;
        } catch (error: unknown) {
            const status = (error as any)?.response?.status;
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

    // Check Input Moderation
    for (const msg of messages) {
        const textToCheck =
            typeof msg.content === 'string' ? msg.content : msg.content.map((c: AiContent) => c.text).join(' ');
        const moderation = await checkModeration(textToCheck);
        if (moderation.flagged) {
            return {
                data: {
                    choices: [
                        {
                            message: {
                                content: "I'm sorry, but I can't fulfill this request. I'm unable to generate content that violates safety policies, including material that is inappropriate or offensive. Is there anything else I can help you with?",
                                role: 'assistant',
                            },
                            index: 0,
                            finish_reason: 'content_filter',
                        },
                    ],
                    model: models[0],
                },
                latencyMs: Date.now() - start,
                isBlocked: true,
                blockedReason: moderation.reason,
            } as AiResponse;
        }
    }

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

            const aiResponse: AiResponse = {
                data: response.data,
                latencyMs: Date.now() - start,
            };

            // Check Output Moderation
            const outputText = aiResponse.data.choices[0]?.message?.content || '';
            const outputModeration = await checkModeration(outputText);
            if (outputModeration.flagged) {
                if (aiResponse.data.choices[0]) {
                    aiResponse.data.choices[0].message.content =
                        `I'm sorry, I cannot fulfill this request. My safety guidelines prohibit me from generating content of this nature. Please let me know if there's anything else you'd like to discuss!`;
                }
                aiResponse.isBlocked = true;
                aiResponse.blockedReason = outputModeration.reason;
            }

            return aiResponse;
        } catch (error: unknown) {
            const status = (error as any)?.response?.status;
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
