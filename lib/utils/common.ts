import crypto from 'crypto';
import CryptoJS from 'crypto-js';
import { Types, UpdateQuery } from 'mongoose';
import moment from 'moment-timezone';
import { TypesObjectId } from '@schemas';
import { patterns } from './validate';

const { ObjectId } = Types;

const isDevEnv = process.env.NODE_ENV === 'development';

const randomString = (length: number = 30): string => {
    let result: string = '';
    while (result.length < length) {
        result += crypto
            .randomBytes(length)
            .toString('hex')
            .substring(2, length + 2);
    }

    return result;
};

const generateSecurePassword = (length: number = 8): string => {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%^&*-';
    const charsetLength = charset.length;

    if (length < 8 || length > 15) {
        throw new Error('Password length must be between 8 and 15 characters.');
    }

    let password = '';

    do {
        password = '';
        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * charsetLength);
            password += charset.charAt(randomIndex);
        }
    } while (!patterns.password.test(password));

    return password;
};

const escapeRegex = (text: string): string => text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');

const isValidObjectId = (objectId: string): boolean => {
    if (ObjectId.isValid(objectId)) {
        const id: TypesObjectId = new ObjectId(objectId);
        return id.toString() === objectId;
    }
    return false;
};

const toObjectId = (id: string): TypesObjectId => new ObjectId(id);

const generateOtp = (length: number = 6): string => {
    let result = '';
    if (isDevEnv) {
        result = '123456';
    } else {
        while (result.length < length) {
            result += crypto.randomInt(0, 9).toString();
        }
    }

    return result.padEnd(length, '0');
};

const showDate = (
    date: Date | number = new Date(),
    timeZone: string = 'UTC',
    format: string = 'MMM DD YYYY hh:mm:ss A'
): string => moment(date).tz(timeZone).format(format);

const fromNow = (date: Date): string => moment(date).fromNow();

const getSearchRegex = (text: string | undefined): RegExp | null =>
    text
        ? new RegExp(
              text
                  .split(' ')
                  .filter(val => val)
                  .map(value => value.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&'))
                  .join(' '),
              'i'
          )
        : null;

const getUpdateQuery = <T>(data: T): UpdateQuery<T> => {
    const unsetFields: Partial<Record<keyof T, true>> = {};
    const setFields: Partial<T> = {};

    for (const key in data) {
        if (data[key as keyof T] === undefined) {
            unsetFields[key as keyof T] = true;
        } else {
            setFields[key as keyof T] = data[key as keyof T];
        }
    }

    return {
        ...(Object.keys(setFields).length > 0 && { $set: setFields }),
        ...(Object.keys(unsetFields).length > 0 && { $unset: unsetFields }),
    };
};

const allowedDomainPatterns: RegExp[] = [/\.healthlynk\.in$/, /\.healthlynk\.com$/];

const otherAllowedDomains: string[] =
    process.env.IS_ANY_OTHER_DOMAINS_ALLOWED === 'true' ? ['http://localhost:8081'] : [];

const getSessionCookieDomain = (origin: string): string | undefined => {
    if (origin.endsWith('.healthlynk.in')) {
        return '.healthlynk.in';
    } else if (origin.endsWith('.healthlynk.com')) {
        return '.healthlynk.com';
    }

    return undefined;
};

const encrypt = (text: string): string => {
    return encodeURIComponent(CryptoJS.AES.encrypt(text, process.env.SECRET_ENCRYPTION_KEY).toString());
};

const decrypt = (encryptedText: string): string => {
    const bytes = CryptoJS.AES.decrypt(decodeURIComponent(encryptedText), process.env.SECRET_ENCRYPTION_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
};

const titleCase = (name: string): string => {
    return name
        .trim()
        .toLowerCase()
        .split(/\s+/)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
};

export {
    isDevEnv,
    randomString,
    generateSecurePassword,
    escapeRegex,
    isValidObjectId,
    toObjectId,
    generateOtp,
    showDate,
    fromNow,
    getSearchRegex,
    getUpdateQuery,
    allowedDomainPatterns,
    otherAllowedDomains,
    getSessionCookieDomain,
    encrypt,
    decrypt,
    titleCase,
};
