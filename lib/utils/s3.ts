import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { DocumentExtensions, ExtensionToMime, ImageExtensions, VideoExtensions } from '@enums';
import { logger, randomString } from '@utils';
import { Readable } from 'stream';

interface AWSConfig {
    region: string;
    credentials?: {
        accessKeyId: string;
        secretAccessKey: string;
    };
}

interface UploadFile {
    buffer: Buffer;
    location: string;
    extension: ImageExtensions | VideoExtensions | DocumentExtensions;
}

const accessKeyId = process.env.AWS_S3_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_S3_SECRET_ACCESS_KEY;
const region = process.env.AWS_S3_REGION;
const bucket = process.env.AWS_S3_BUCKET;

const awsConfig: AWSConfig = {
    region,
    credentials: {
        accessKeyId,
        secretAccessKey,
    },
};

if (process.env.REMOVE_S3_CREDENTIALS === 'true') {
    delete awsConfig.credentials;
}

const s3Client = new S3Client(awsConfig);

const uploadFile = async ({ buffer, location, extension }: UploadFile): Promise<string> => {
    const key = `${location}/${randomString()}.${extension}`;

    try {
        const command = new PutObjectCommand({
            Bucket: bucket,
            Key: key,
            Body: buffer,
            // ACL: 'public-read',
        });
        await s3Client.send(command);
    } catch (err) {
        if (err) {
            logger.error('UTILS:: uploadFile: error while reading temporary file:', err);
            throw err;
        }
    }

    return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
};

const downloadFile = async (key: string): Promise<Buffer> => {
    const command = new GetObjectCommand({ Bucket: bucket, Key: key });
    const response = await s3Client.send(command);

    const stream = response.Body as Readable;

    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
        chunks.push(Buffer.from(chunk));
    }

    return Buffer.concat(chunks);
};

const extractS3Key = (url: string): string => {
    const urlObj = new URL(url);
    let key = urlObj.pathname;

    if (key.startsWith('/')) key = key.substring(1);

    return key;
};

const detectMimeType = (key: string): string => {
    const ext = key.split('.').pop()?.toLowerCase();

    if (!ext) return 'application/octet-stream';

    return ExtensionToMime[ext] ?? 'application/octet-stream';
};

export { uploadFile, downloadFile, extractS3Key, detectMimeType };
