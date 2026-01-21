import { NextFunction, Request, RequestHandler, Response } from 'express';
import { sign, verify } from 'jsonwebtoken';
import { IUserDoc, TypesObjectId } from '@schemas';
import { getLanguage, getPlatform } from './common';
import { SessionStatus, UserAccountType } from '@enums';
import { SignUserToken, VerifyUserAccess } from '@dto';
import { logger } from '@utils';
import UserDao from '../dao/UserDao';
import { __ } from '@lib/i18n';
import SessionDao from '../dao/SessionDao';
import moment from 'moment';

const accountType = [UserAccountType.SUPER_ADMIN, UserAccountType.SEEKER];

export const signToken = ({ sub, iat, aud, sessionID }: SignUserToken) =>
    sign({ sub, iat, aud, sessionID }, process.env.JWT_SECRET);

export const verifyUserAccess = async ({
    token,
    platform,
    language,
}: VerifyUserAccess): Promise<{
    success: boolean;
    error?: string;
    user?: IUserDoc;
    session?: TypesObjectId;
}> => {
    try {
        const decoded = verify(token, process.env.JWT_SECRET) as unknown as SignUserToken;

        if (!decoded?.sub || decoded.aud !== platform) {
            return {
                success: false,
                error: __(language, 'UNAUTHORIZED'),
            };
        }

        const tokenSubArray = decoded.sub.split('-');

        const user = await UserDao.getUserById({
            id: tokenSubArray[0] as unknown as TypesObjectId,
        });

        if (!user) {
            return {
                success: false,
                error: __(language, 'USER_NOT_FOUND'),
            };
        }

        // if (user.status === Status.INACTIVE) {
        //     return {
        //         success: false,
        //         error: __(language, 'YOUR_ACCOUNT_SUSPENDED'),
        //     };
        // }

        if (user.authTokenIssuedAt !== decoded.iat) {
            return {
                success: false,
                error: __(language, 'SESSION_EXPIRED'),
            };
        }

        const session = await SessionDao.getSessionById({
            id: decoded.sessionID as unknown as TypesObjectId,
            user: user._id,
        });

        if (
            process.env.VALIDATE_SESSION === 'true' &&
            (!session || session.status === SessionStatus.EXPIRED || moment().unix() > session.validTill)
        ) {
            return {
                success: false,
                error: __(language, 'SESSION_EXPIRED'),
            };
        }

        return {
            success: true,
            user,
            session: session?._id,
        };
    } catch (e) {
        if (e) {
            return {
                success: false,
                error: __(language, 'UNAUTHORIZED'),
            };
        }
    }

    return {
        success: false,
        error: __(language, 'UNAUTHORIZED'),
    };
};

export const verifyToken = (permission?: string) =>
    (async (req: Request, res: Response, next: NextFunction) => {
        const token = <string>req.headers.authorization;
        const platform = getPlatform(req);
        const language = getLanguage(req);
        const response = await verifyUserAccess({
            token,
            permission,
            platform,
            language,
        });

        if (!response.success || !response.user) {
            logger.error('verifyToken:: authentication error', response.error);
            return res.unauthorized(null, response.error);
        }

        req.user = response.user;
        req.session = response.session as unknown as TypesObjectId;
        return next();
    }) as RequestHandler;
