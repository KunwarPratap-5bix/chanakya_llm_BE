import { NextFunction, Request, RequestHandler, Response } from 'express';
import { ObjectSchema, ValidationOptions, ValidationResult } from 'joi';
import { mapErrorMessage } from '@lib/i18n';
import { getLanguage } from './common';
import { logger } from '@utils';
import { Languages } from '@dto';

type RequestDataField = 'body' | 'params' | 'query' | 'headers';

export const validate = (
    schema: ObjectSchema,
    field: RequestDataField = 'body',
    options: ValidationOptions = {},
    preserveOptionalKeys: boolean = false
) =>
    (async (req: Request, res: Response, next: NextFunction) => {
        const result: ValidationResult = schema.validate(req[field], options);

        if (!result.error) {
            if (preserveOptionalKeys) {
                const schemaKeys = Object.keys(schema.describe().keys);
                schemaKeys.forEach(key => {
                    if (!(key in result.value)) {
                        result.value[key] = undefined;
                    }
                });
            }

            req[field] = result.value;
            return next();
        }

        logger.error('Request validation failed with error', JSON.stringify(result.error));
        return res.badRequest(null, mapErrorMessage(getLanguage(req), result.error));
    }) as RequestHandler;

export const csvValidate = (
    schema: ObjectSchema,
    data: unknown,
    language: Languages = 'en',
    options: ValidationOptions = {
        abortEarly: false,
    }
) => {
    const result: ValidationResult = schema.validate(data, options);

    if (!result.error) {
        return {
            data: result.value,
            error: null,
        };
    }

    logger.error('CSV validation failed with error', JSON.stringify(result.error));

    return {
        data: null,
        error: mapErrorMessage(language, result.error),
    };
};
