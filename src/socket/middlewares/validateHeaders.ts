import { Server, Socket } from 'socket.io';
import { Platform } from '@enums';
import { Languages, languages } from '@dto';
import { __, mapErrorMessage } from '@lib/i18n';
import { joi, logger, patterns } from '@utils';

export const validateHeaders = (io: Server) => {
    io.of(/^\/.*$/).use((socket: Socket, next: (err?: Error) => void) => {
        const headers = socket.handshake.headers;
        const schema = joi
            .object({
                'x-platform': joi
                    .string()
                    .trim()
                    .valid(...Object.values(Platform))
                    .required(),
                'x-version': joi.string().trim().regex(patterns.version, 'semanticPattern').required(),
                'x-time-zone': joi.number().required(),
                'accept-language': joi
                    .string()
                    .trim()
                    .valid(...languages)
                    .required(),
            })
            .required();

        const { error, value } = schema.validate(headers, { allowUnknown: true });
        const language = (headers['accept-language'] as Languages) || 'en';

        if (error) {
            const message = mapErrorMessage(language, error);
            logger.error(`❌ Socket header validation failed for ${socket.id}: ${message}`);
            return next(new Error(__(language, message)));
        }

        socket.data.platform = value['x-platform'];
        socket.data.version = value['x-version'];
        socket.data.timeZone = value['x-time-zone'];
        socket.data.language = language;

        next();
    });
};
