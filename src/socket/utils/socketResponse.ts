import { Socket } from 'socket.io';
import { logger } from '@utils';
import { __ } from '@lib/i18n';
import { Languages } from '@dto';

export interface SocketResponseTypes {
    success: (event: string, data?: object | null, messageKey?: string, ...params: string[]) => void;
    badRequest: (event: string, data?: object | null, messageKey?: string, ...params: string[]) => void;
    unauthorized: (event: string, data?: object | null, messageKey?: string, ...params: string[]) => void;
    forbidden: (event: string, data?: object | null, messageKey?: string, ...params: string[]) => void;
    serverError: (
        event: string,
        data?: object | null,
        messageKey?: string,
        err?: Error | null,
        ...params: string[]
    ) => void;
}

const logResponse = ({ success, event, message }: { success: boolean; event: string; message?: string }) => {
    logger.silly(`SOCKET_RESPONSE:: event: ${event}, success: ${success}, message: ${message}`);
};

export const createSocketResponse = (socket: Socket): SocketResponseTypes => {
    const language = (socket.data.language as Languages) || 'en';

    return {
        success(event, data = null, messageKey = '', ...params) {
            const message = messageKey ? __(language, messageKey, ...params) : '';
            logResponse({ success: true, event, message });
            socket.emit(event, { success: true, data, message });
        },
        badRequest(event, data = null, messageKey = '', ...params) {
            const message = messageKey ? __(language, messageKey, ...params) : '';
            logResponse({ success: false, event, message });
            socket.emit(event, { success: false, data, message });
        },
        unauthorized(event, data = null, messageKey = '', ...params) {
            const message = messageKey ? __(language, messageKey, ...params) : '';
            logResponse({ success: false, event, message });
            socket.emit(event, { success: false, data, message });
        },
        forbidden(event, data = null, messageKey = '', ...params) {
            const message = messageKey ? __(language, messageKey, ...params) : '';
            logResponse({ success: false, event, message });
            socket.emit(event, { success: false, data, message });
        },
        serverError(event, data = null, messageKey = '', err = null, ...params) {
            if (err) logger.error(`Socket server error on event ${event}:`, err);
            const message = messageKey ? __(language, messageKey, ...params) : '';
            logResponse({ success: false, event, message });
            socket.emit(event, { success: false, data, message });
        },
    };
};
