import { DocumentExtensions, ImageExtensions, VideoExtensions } from '@enums';
import { joi } from '@utils';

const uploadFiles = joi.object().keys({
    files: joi
        .array()
        .items({
            location: joi.string().trim().required(),
            extension: joi
                .string()
                .trim()
                .valid(
                    ...[
                        ...Object.values(ImageExtensions),
                        ...Object.values(VideoExtensions),
                        ...Object.values(DocumentExtensions),
                    ]
                )
                .required(),
        })
        .min(1)
        .max(10)
        .required(),
});

const deleteFiles = joi.object().keys({
    locations: joi.array().items(joi.string().trim().required()).min(1).required(),
});

export default {
    uploadFiles,
    deleteFiles,
};
