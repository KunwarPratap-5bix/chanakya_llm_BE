import { Server } from 'socket.io';

let mio: Server | null = null;

export const setSocketInstance = (io: Server) => {
    mio = io;
};

export const getSocketInstance = (): Server => {
    if (!mio) {
        throw new Error('Socket instance not initialized yet');
    }
    return mio;
};

export { mio };
