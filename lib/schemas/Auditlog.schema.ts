import { Document, Model } from 'mongoose';
import { TypesObjectId } from '../schemas';

export interface IAuditLog {
    userId: TypesObjectId;
    action: string;
    targetId: TypesObjectId;
    targetType: string;
    timestamp: Date;
    ipAddress: string;
    details: object;
}

export interface IAuditLogDoc extends IAuditLog, Document {
    _id: TypesObjectId;
    createdAt: Date;
    updatedAt: Date;
}

export type IAuditLogModel = Model<IAuditLogDoc>;
