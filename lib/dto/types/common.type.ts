import { DocumentExtensions, ImageExtensions, VideoExtensions } from '@enums';

export interface ExpressError extends Error {
    status: number;
}

export interface NewContactUsMessage {
    name: string;
    email: string;
    phone: string;
    subject: string;
    message: string;
}

export interface FileInfo {
    location: string;
    extension: ImageExtensions | VideoExtensions | DocumentExtensions;
}

export interface UploadFiles {
    files: FileInfo[];
}
