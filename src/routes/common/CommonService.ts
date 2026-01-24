import { Request, Response } from 'express';
import * as enums from '@enums';

const availableCountries = ['India'];

class CommonService {

    async getConfigurations(req: Request, res: Response) {
        return res.success({
            enums,
        });
    }
}

export default new CommonService();
