import JoiDate from '@joi/date';
import BaseJoi from 'joi';

import { ModelValidationError } from '../../../../shared/domain/errors.js';
const Joi = BaseJoi.extend(JoiDate);

const validationConfiguration = { allowUnknown: true, abortEarly: false };

const validateCommonOrganizationLearner = function (commonOrganizationLearner, validationFormatRules) {
  const attributeRule = {};
  validationFormatRules?.forEach(({ name, type, format, required }) => {
    if (type === 'date') {
      attributeRule[name] = Joi.date()
        .format(format)
        .presence(required ? 'required' : 'optional');
    }
  });
  const validationSchema = Joi.object({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    organizationId: Joi.number().required(),
    attributes: Joi.object(attributeRule).required().empty(null),
  });

  const { error: validationErrors } = validationSchema.validate(commonOrganizationLearner, validationConfiguration);
  if (validationErrors?.details.length > 0) {
    return validationErrors.details.map((error) => {
      return ModelValidationError.fromJoiError(error);
    });
  } else {
    return [];
  }
};

export { validateCommonOrganizationLearner };
