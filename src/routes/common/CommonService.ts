import { Request, Response } from 'express';
import CommonDao from '../../dao/CommonDao';
import * as enums from '@enums';

const availableCountries = ['India'];

class CommonService {
    async getAllCountries(req: Request, res: Response) {
        const countries = await CommonDao.getAllCountries({
            name: {
                $in: availableCountries,
            },
        });

        return res.success(countries);
    }

    async getConfigurations(req: Request, res: Response) {
        return res.success({
            enums,
        });
    }
}

export default new CommonService();
