import { DeleteObjectCommand, GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import * as ExcelJS from 'exceljs';
import { Readable } from 'node:stream';
import { TypesObjectId } from '@schemas';

interface AWSConfig {
    region: string;
    credentials?: {
        accessKeyId: string;
        secretAccessKey: string;
    };
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

const csvToJson = async <T>(key: string, customData?: Record<string, any>, arrayKeys?: string[]): Promise<T> => {
    const command = new GetObjectCommand({
        Bucket: bucket,
        Key: key,
    });

    const response = await s3Client.send(command);

    const csvData = await response.Body?.transformToString();

    const lines = csvData
        ?.split('\n')
        .map(line => line.trim())
        .filter(line => line !== '');

    const headers = lines?.length ? lines[0]?.split(',') : [];

    const result = lines?.slice(1).map(line => {
        const values = line.split(',');
        const obj: Record<string, string | undefined> = {};

        headers?.forEach((header: string, index: number) => {
            const cleanHeader = header.replace('\r', '').trim();
            const cleanValue = values[index]?.replace('\r', '').trim() || '';

            if (cleanValue) {
                obj[cleanHeader] = cleanValue;
            }

            for (const key in customData) {
                obj[key] = arrayKeys?.includes(key) ? customData[key]?.split(',') : customData[key];
            }
        });

        return obj;
    });

    s3Client.send(
        new DeleteObjectCommand({
            Bucket: bucket,
            Key: key,
        })
    );

    return JSON.parse(JSON.stringify(result));
};

const excelToJson = async <T>(
    key: string,
    customData: Record<string, string | TypesObjectId> = {},
    arrayKeys: string[] = []
): Promise<T> => {
    const command = new GetObjectCommand({
        Bucket: bucket,
        Key: key,
    });

    const response = await s3Client.send(command);
    const buffer = await streamToBuffer(response.Body as unknown as Readable);

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer as unknown as ArrayBuffer);

    const sheet = workbook.getWorksheet('Sheet1');
    const data: T[] = [];

    if (!sheet) {
        throw new Error('Sheet1 not found in the Excel file.');
    }

    sheet.eachRow({ includeEmpty: false }, (row: ExcelJS.Row, rowNumber: number) => {
        if (rowNumber > 1) {
            const obj = {} as unknown as T;

            const rowValues = JSON.parse(JSON.stringify(row.values));

            if (rowValues.filter((i: T) => i).length) {
                for (let i = 1; i <= rowValues.length; i++) {
                    let value = rowValues[i];

                    if (value) {
                        if (typeof value === 'object') {
                            value = value.text as unknown as string;
                        }

                        const columnName = sheet.getRow(1).getCell(i).value as keyof T;
                        obj[columnName] = value as unknown as T[Extract<keyof T, string>];
                    }
                }

                for (const key in customData) {
                    obj[key as keyof T] = customData[key] as unknown as T[Extract<keyof T, string>];
                }

                arrayKeys.forEach(item => {
                    obj[item as keyof T] = ((obj[item as keyof T] as string)?.split(',')?.filter(i => i) ||
                        []) as unknown as T[Extract<keyof T, string>];
                });

                data.push(obj);
            }
        }
    });

    await s3Client.send(
        new DeleteObjectCommand({
            Bucket: bucket,
            Key: key,
        })
    );

    return JSON.parse(JSON.stringify(data));
};

const streamToBuffer = async (stream: Readable): Promise<Buffer> => {
    return new Promise((resolve, reject) => {
        const chunks: Buffer[] = [];
        stream.on('data', (chunk: Buffer) => chunks.push(chunk));
        stream.on('end', () => resolve(Buffer.concat(chunks)));
        stream.on('error', (err: Error) => reject(err));
    });
};

export { csvToJson, excelToJson, streamToBuffer };
