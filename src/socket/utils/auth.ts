import { logger } from '@utils';
import { ExtendedError, Socket } from 'socket.io';
import { verifyUserAccess } from '../../utils/auth';
import { __ } from '@lib/i18n';

export const verifyToken = (permission?: string) => async (socket: Socket, next: (err?: ExtendedError) => void) => {
    const language = socket.data.language || 'en';
    const platform = socket.data.platform;
    const token = socket.handshake.headers.authorization as string;

    const response = await verifyUserAccess({
        token,
        permission,
        platform,
        language,
    });

    if (!response.success || !response.user) {
        logger.error('verifyToken:: authentication error', response.error);
        return next(new Error(__(language, response.error || 'UNAUTHORIZED')));
    }

    socket.data.user = response.user;
    return next();
};
