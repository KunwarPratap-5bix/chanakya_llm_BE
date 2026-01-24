import { Server } from 'socket.io';
import http from 'http';
import https from 'https';
import { logger } from '@utils';
import { setupBaseNamespace } from './baseNameSpace';
import { validateHeaders } from './middlewares';

export const initSocket = async (server: http.Server | https.Server) => {
    const io = new Server(server, {
        cors: {
            origin: process.env.CLIENT_URL || '*',
            methods: ['GET', 'POST'],
            credentials: true,
        },
        transports: ['websocket', 'polling'],
        pingTimeout: 60000,
        pingInterval: 25000,
    });

    validateHeaders(io);

    io.on('connection', socket => {
        logger.warn(`⚠️ Blocking connection on default namespace for socket ${socket.id}`);
        socket.disconnect(true);
    });

    setupBaseNamespace(io.of('/base'));

    logger.info('✅ Socket.IO initialized');
    return io;
};
