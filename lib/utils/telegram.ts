import axios from 'axios';
import { logger } from './logger';

export const sendTelegramMessage = async (message: string): Promise<void> => {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!token || !chatId) {
        logger.warn('Telegram token or chat ID not provided. Skipping message send.');
        return;
    }

    try {
        const url = `https://api.telegram.org/bot${token}/sendMessage`;
        await axios.post(url, {
            chat_id: chatId,
            text: message,
            parse_mode: 'Markdown',
        });
        logger.info('Telegram message sent successfully');
    } catch (error: any) {
        logger.error('Failed to send Telegram message:', error.response?.data || error.message);
    }
};
