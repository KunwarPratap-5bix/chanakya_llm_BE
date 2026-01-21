import winston, { createLogger, Logger as WinstonLogger } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { showDate } from '@utils';

enum LogLevels {
    ERROR = 'error',
    WARN = 'warn',
    INFO = 'info',
    VERBOSE = 'verbose',
    DEBUG = 'debug',
    SILLY = 'silly',
}

class Logger {
    private readonly logger: WinstonLogger;
    private readonly level: string = process.env.LOG_LEVEL || LogLevels.SILLY;
    private readonly serverName: string = process.env.SERVER_NAME || 'SERVER_NAME';
    private readonly consoleFormat = winston.format.combine(
        winston.format.colorize({ all: true }),
        winston.format.timestamp(),
        winston.format.align(),
        winston.format.printf(info => `[${showDate()}] ${info.level}: ${info.message}`)
    );
    private readonly fileFormat = winston.format.combine(
        winston.format.uncolorize(),
        winston.format.timestamp(),
        winston.format.align(),
        winston.format.printf(info => `[${showDate()}] ${info.level}: ${info.message}`)
    );

    constructor() {
        this.logger = createLogger({
            level: this.level,
            format: this.consoleFormat,
            transports: [
                new winston.transports.Console(),
                new DailyRotateFile({
                    filename: `logs/combined-${this.serverName}-%DATE%.log`,
                    maxSize: '10m',
                    maxFiles: '30d',
                    format: this.fileFormat,
                }),
            ],
            exceptionHandlers: [
                new winston.transports.Console(),
                new DailyRotateFile({
                    filename: `logs/exception-${this.serverName}-%DATE%.log`,
                    maxSize: '10m',
                    maxFiles: '30d',
                    format: this.fileFormat,
                }),
            ],
            rejectionHandlers: [
                new winston.transports.Console(),
                new DailyRotateFile({
                    filename: `logs/rejection-${this.serverName}-%DATE%.log`,
                    maxSize: '10m',
                    maxFiles: '30d',
                    format: this.fileFormat,
                }),
            ],
        });
    }

    private log(level: LogLevels, ...args: unknown[]) {
        let message = '';
        const separator = (index: number) => (message.length && index < args.length - 1 ? ', ' : '');
        args.forEach((i, index) => {
            const argType = typeof i;
            if (i instanceof Error) {
                message = `${message}${JSON.stringify({ message: i?.message, stack: i?.stack?.split('\n') })}${separator(index)}`;
            } else if (i instanceof Map) {
                message = `${message}${JSON.stringify(Array.from(i.entries()))}${separator(index)}`;
            } else if (argType === 'object') {
                message = `${message}${JSON.stringify(i)}${separator(index)}`;
            } else {
                message = `${message}${i}`;
                message = `${message}${separator(index)}`;
            }
        });

        this.logger.log(level, message);

        // eslint-disable-next-line no-console
        console.log = (...args: unknown[]) => this.log(LogLevels.INFO, ...args);

        // eslint-disable-next-line no-console
        console.debug = (...args: unknown[]) => this.log(LogLevels.DEBUG, ...args);

        // eslint-disable-next-line no-console
        console.info = (...args: unknown[]) => this.log(LogLevels.INFO, ...args);

        // eslint-disable-next-line no-console
        console.warn = (...args: unknown[]) => this.log(LogLevels.WARN, ...args);

        // eslint-disable-next-line no-console
        console.error = (...args: unknown[]) => this.log(LogLevels.ERROR, ...args);
    }

    error(...args: unknown[]) {
        this.log(LogLevels.ERROR, ...args);
    }

    warn(...args: unknown[]) {
        this.log(LogLevels.WARN, ...args);
    }

    info(...args: unknown[]) {
        this.log(LogLevels.INFO, ...args);
    }

    verbose(...args: unknown[]) {
        this.log(LogLevels.VERBOSE, ...args);
    }

    debug(...args: unknown[]) {
        this.log(LogLevels.DEBUG, ...args);
    }

    silly(...args: unknown[]) {
        this.log(LogLevels.SILLY, ...args);
    }

    http(msg: string, meta?: Record<string, unknown>) {
        this.logger.http(msg, meta);
    }
}

export const logger = new Logger();
