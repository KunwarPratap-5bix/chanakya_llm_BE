import { IUserDoc, TypesObjectId } from '@lib/schemas';
import { ResponseTypes } from '@lib/http-response';

declare global {
    namespace Express {
        interface Request {
            __: (key: string, ...params: string[]) => string;
            user: IUserDoc;
            isSuperAdminMerchantOrSSO: boolean;
            session: TypesObjectId;
        }
        interface Response extends ResponseTypes {}
    }
}
export {};
