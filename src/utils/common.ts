import { Request } from 'express';
import path from 'path';
import fs from 'fs';
import { Languages } from '@dto';
import { Platform } from '@enums';
import { IUserDoc } from '@schemas';
import { ejsTemplateToPdfBuffer } from '@utils';

export const getLanguage = (req: Request) => (req.headers['accept-language'] ?? 'en') as Languages;

export const getPlatform = (req: Request) => req.headers['x-platform'] as Platform;

export const getTimeZone = (req: Request) => req.headers['x-time-zone'] as unknown as number;

export const userKeysToBeRemoved = [
    'password',
    'failedLoginAttempts',
    'preventLoginTill',
    'authTokenIssuedAt',
    'mobileNetDescriptors',
    'tinyFaceDescriptors',
    'MFAToken',
    'loginToken',
    'loginPin',
    'isFake',
    '__v',
    'createdAt',
    'updatedAt',
];

export const getUserObj = (userDoc: IUserDoc) => {
    const user = userDoc.toJSON();
    userKeysToBeRemoved.forEach(key => delete user[key]);
    return user;
};

export const parseTime = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number);
    return (hours || 0) * 60 + (minutes || 0);
};

export const exportPdf = async (template: string, data: object[]) => {
    const templatePath = path.join(__dirname, '..', 'views', template);
    const templateContent = fs.readFileSync(templatePath, 'utf-8');

    const pdfBuffer = await ejsTemplateToPdfBuffer(templateContent, data);

    return pdfBuffer;
};
