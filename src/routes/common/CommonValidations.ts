import { commonValidations, joi } from '@utils';

const contactUs = joi.object().keys({
    name: joi.string().trim().required(),
    email: commonValidations.email,
    phone: commonValidations.phone,
    subject: joi.string().trim().required(),
    message: joi.string().trim().required(),
});

export default {
    contactUs,
};
