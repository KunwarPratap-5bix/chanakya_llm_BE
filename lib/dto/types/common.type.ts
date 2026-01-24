import { DocumentExtensions, ImageExtensions, VideoExtensions } from '@enums';

export interface ExpressError extends Error {
    status: number;
}

export interface FileInfo {
    location: string;
    extension: ImageExtensions | VideoExtensions | DocumentExtensions;
}

export interface UploadFiles {
    files: FileInfo[];
}
