import { Namespace, Socket } from 'socket.io';
import { createSocketResponse } from './utils/socketResponse';
import { logger } from '@utils';
import { verifyToken } from './utils/auth';

export const setupBaseNamespace = (nsp: Namespace) => {
    nsp.use(verifyToken());

    nsp.on('connection', async (socket: Socket) => {
        const user = socket.data.user;

        const socketResponse = createSocketResponse(socket);

        logger.info(`🟢 [BASE] User ${user._id} connected (${socket.id})`);


        socketResponse.success('connected', { socketId: socket.id }, 'CONNECTED_SUCCESS');

        socket.on('pong', () => {
            socket.data.pong = true;
        });

        const pingInterval = setInterval(async () => {
            if (!socket.data.pong) {
                clearInterval(pingInterval);
                socket.disconnect();
                logger.warn(`⚠️ [BASE] User ${user._id} disconnected due to ping timeout`);
            } else {
                socket.data.pong = false;
                socket.emit('ping');
            }
        }, 5000);

        socket.data.pingInterval = pingInterval;

        socket.on('disconnect', async reason => {
            if (socket.data.pingInterval) {
                clearInterval(socket.data.pingInterval);
            }
            logger.info(`🔴 [BASE] User ${user._id} disconnected (${reason})`);
        });

        socket.on('error', error => {
            logger.error(`❌ [BASE] Socket error for user ${user._id}:`, error);
            socketResponse.serverError('error', null, 'GENERAL_ERROR', error as Error);
        });

        socket.on('send_message', data => {
            const toRoom = data?.roomId as string;
            if (toRoom) {
                socket.to(toRoom).emit('message', { success: true, data });
            } else {
                socketResponse.badRequest('message_error', null, 'INVALID_REQUEST');
            }
        });
    });
};
