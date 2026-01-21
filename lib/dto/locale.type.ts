import { ValidationErrorItem } from 'joi';

const languages = ['en', 'ar'] as const;

type ValidationKeys = Record<string, string>;

type ValidationMessages = Record<string, string>;

type ValidationMessage = (error: ValidationErrorItem) => string;

type Languages = (typeof languages)[number];

interface Validations {
    'any.required': ValidationMessage;
    'any.unknown': ValidationMessage;
    'any.invalid': ValidationMessage;
    'any.empty': ValidationMessage;
    'any.allowOnly': ValidationMessage;
    'any.custom': ValidationMessage;
    'string.base': ValidationMessage;
    'string.min': ValidationMessage;
    'string.max': ValidationMessage;
    'string.hex': ValidationMessage;
    'string.length': ValidationMessage;
    'string.pattern.name': ValidationMessage;
    'number.base': ValidationMessage;
    'number.min': ValidationMessage;
    'number.max': ValidationMessage;
    'number.integer': ValidationMessage;
    'objectId.isValid': ValidationMessage;
    'object.base': ValidationMessage;
    'object.xor': ValidationMessage;
    'object.with': ValidationMessage;
    'object.without': ValidationMessage;
    'object.and': ValidationMessage;
    'object.missing': ValidationMessage;
    'array.min': ValidationMessage;
    'array.max': ValidationMessage;
    'array.unique': ValidationMessage;
}

interface I18n {
    validationKeys: ValidationKeys;
    validationMessages: ValidationMessages;
    validations: Validations;
}

type Locale = Record<Languages, I18n>;

export { languages, ValidationKeys, ValidationMessages, Validations, Languages, I18n, Locale };
