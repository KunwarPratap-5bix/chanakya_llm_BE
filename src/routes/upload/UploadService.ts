import { Request, Response } from 'express';
import { UploadFiles } from '@dto';
import { deleteFile, getPreSignedUrl } from '@utils';

class UploadService {
    async uploadFiles(req: Request, res: Response) {
        const { files }: UploadFiles = req.body;
        const promises = files.map(info =>
            getPreSignedUrl({
                location: info.location,
                extension: info.extension,
            })
        );
        const urls = await Promise.all(promises);

        return res.success(urls);
    }

    async deleteFiles(req: Request, res: Response) {
        const locations: string[] = req.body.locations;
        const promises = locations.map(location => deleteFile(location));
        await Promise.all(promises);

        return res.success(null, req.__('FILES_REMOVED'));
    }
}

export default new UploadService();
