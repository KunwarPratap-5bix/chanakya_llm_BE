import { ValidationError } from 'joi';
import { I18n, Languages, Locale, Validations } from '@dto';
import en from './locales/en';
import ar from './locales/ar';

const locale: Locale = {
    en,
    ar,
};

const __ = function (language: Languages, key: string, ...params: string[]): string {
    const i18n: I18n = locale[language] || locale.en;
    let message = i18n?.validationMessages[key] ?? key;
    params.forEach((param: string, index: number) => {
        message = message.replace(new RegExp(`\\{${index}}`), i18n?.validationKeys[param] ?? param);
    });
    return message;
};

const mapErrorMessage = (language: Languages, error: ValidationError): string => {
    if (!error?.details[0]?.message) {
        return __(language, 'INVALID_REQUEST');
    }

    const i18n: I18n = locale[language] || locale.en;
    let errorType = error.details[0].type as keyof Validations;
    const rule = errorType.split('.')[1];

    if (rule && ['required', 'unknown', 'invalid', 'empty', 'allowOnly'].includes(rule)) {
        errorType = `any.${rule}` as keyof Validations;
    }

    if (i18n.validations[errorType]) {
        return i18n.validations[errorType](error.details[0]);
    }

    return error.details[0].message;
};

export { __, locale, mapErrorMessage };
