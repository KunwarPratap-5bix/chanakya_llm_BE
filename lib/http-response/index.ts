import { Response } from 'express';
import { logger } from '@utils';

enum HttpResponseCode {
    OK = 200,
    BAD_REQUEST = 400,
    UNAUTHORIZED = 401,
    FORBIDDEN = 403,
    NOT_FOUND = 404,
    TOO_MANY_REQUESTS = 429,
    SERVER_ERROR = 500,
}

export interface ResponseTypes {
    success: (data: object | null, message?: string | string[]) => void;
    warn: (data: object | null, message?: string | string[]) => void;
    badRequest: (data: object | null, message?: string | string[]) => void;
    unauthorized: (data: object | null, message?: string | string[]) => void;
    forbidden: (data: object | null, message?: string | string[]) => void;
    notFound: (data: object | null, message?: string | string[]) => void;
    tooManyRequests: (data: object | null, message?: string | string[]) => void;
    serverError: (data: object | null, message?: string | string[], err?: Error | null) => void;
}

const logResponse = ({ success, message }: { success: boolean; message?: string | string[] }) => {
    logger.silly(`HTTP_RESPONSE:: success: ${success}, message: ${message}`);
};

const response: ResponseTypes = {
    success(data = null, message = '') {
        logResponse({ success: true, message });
        (this as unknown as Response).status(HttpResponseCode.OK).send({
            success: true,
            data,
            message,
        });
    },
    warn(data = null, message = '') {
        logResponse({ success: false, message });
        (this as unknown as Response).status(HttpResponseCode.BAD_REQUEST).send({
            success: false,
            data,
            message,
        });
    },
    badRequest(data = null, message = '') {
        logResponse({ success: false, message });
        (this as unknown as Response).status(HttpResponseCode.BAD_REQUEST).send({
            success: false,
            data,
            message,
        });
    },
    unauthorized(data = null, message = '') {
        logResponse({ success: false, message });
        (this as unknown as Response).status(HttpResponseCode.UNAUTHORIZED).send({
            success: false,
            data,
            message,
        });
    },
    forbidden(data = null, message = '') {
        logResponse({ success: false, message });
        (this as unknown as Response).status(HttpResponseCode.FORBIDDEN).send({
            success: false,
            data,
            message,
        });
    },
    notFound(data = null, message = '') {
        logResponse({ success: false, message });
        (this as unknown as Response).status(HttpResponseCode.NOT_FOUND).send({
            success: false,
            data,
            message,
        });
    },
    tooManyRequests(data = null, message = '') {
        logResponse({ success: false, message });
        (this as unknown as Response).status(HttpResponseCode.TOO_MANY_REQUESTS).send({
            success: false,
            data,
            message,
        });
    },
    serverError(data = null, message = '', err = null) {
        if (err) logger.error('Server error', err);
        logResponse({ success: false, message });
        (this as unknown as Response).status(HttpResponseCode.SERVER_ERROR).send({
            success: false,
            data,
            message,
        });
    },
};

export { response };
