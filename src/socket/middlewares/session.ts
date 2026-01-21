import type { Request, Response, RequestHandler } from 'express';
import { ExtendedError, Socket } from 'socket.io';

type DummyResponse = Partial<Response>;

export const wrapSocketSession = (middleware: RequestHandler) => {
    return (socket: Socket, next: (err?: ExtendedError) => void) => {
        const req = socket.request as Request;

        const res: DummyResponse = {};

        middleware(req, res as Response, (err?: unknown) => {
            if (err) return next(err as ExtendedError);
            next();
        });
    };
};
