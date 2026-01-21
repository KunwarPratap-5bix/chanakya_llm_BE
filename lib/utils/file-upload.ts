import fs from 'fs';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { DeleteObjectCommand, PutObjectCommand, PutObjectTaggingCommand, S3Client } from '@aws-sdk/client-s3';
import { DocumentExtensions, ImageExtensions, VideoExtensions } from '@enums';
import { logger, randomString } from '@utils';

interface AWSConfig {
    region: string;
    credentials?: {
        accessKeyId: string;
        secretAccessKey: string;
    };
}

interface GetSignedUrl {
    location: string;
    extension: string;
}

interface SignedUrlResponse {
    url: string;
    preview: string;
}

interface RequestFile {
    tempFilePath: string;
}

interface UploadFile {
    file: RequestFile;
    location: string;
    extension: ImageExtensions | VideoExtensions | DocumentExtensions;
}

const accessKeyId = process.env.AWS_S3_ACCESS_KEY_ID as string;
const secretAccessKey = process.env.AWS_S3_SECRET_ACCESS_KEY as string;
const region = process.env.AWS_S3_REGION as string;
const bucket = process.env.AWS_S3_BUCKET as string;

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

const getPreSignedUrl = async ({ location, extension }: GetSignedUrl): Promise<SignedUrlResponse> => {
    const key = `${location}/${randomString()}.${extension}`;
    const tagging = 'status=temporary'; // Add the tag here
    const command = new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        // ACL: 'public-read',
        Tagging: tagging,
    });
    const url = await getSignedUrl(s3Client, command);

    return {
        url,
        preview: `https://${bucket}.s3.${region}.amazonaws.com/${key}`,
    };
};

const uploadLocalFile = async ({ file, location, extension }: UploadFile): Promise<string> => {
    const key = `${location}/${randomString()}.${extension}`;

    try {
        const buffer = fs.readFileSync(file.tempFilePath);
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

const deleteFile = (key: string) => {
    const s3Client = new S3Client(awsConfig);
    const command = new DeleteObjectCommand({
        Bucket: bucket,
        Key: key,
    });

    return s3Client.send(command);
};

const updateObjectTag = async (key: string) => {
    const s3Client = new S3Client(awsConfig);
    const params = {
        Bucket: bucket,
        Key: key,
        Tagging: {
            TagSet: [
                {
                    Key: 'status',
                    Value: 'permanent',
                },
            ],
        },
    };

    const command = new PutObjectTaggingCommand(params);

    await s3Client.send(command);
};

export { getPreSignedUrl, uploadLocalFile, deleteFile, updateObjectTag };
