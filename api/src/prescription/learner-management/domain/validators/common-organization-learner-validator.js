import JoiDate from '@joi/date';
import BaseJoi from 'joi';

import { ModelValidationError } from '../../../../shared/domain/errors.js';
const Joi = BaseJoi.extend(JoiDate);

const validationConfiguration = { allowUnknown: true, abortEarly: false };

const validateCommonOrganizationLearner = function (commonOrganizationLearner, validationFormatRules) {
  const customAttributeRule = {};
  validationFormatRules?.forEach(({ name, type, format, required, min, max, expectedValues }) => {
    if (type === 'date') {
      customAttributeRule[name] = Joi.date()
        .format(format)
        .presence(required ? 'required' : 'optional');
    }

    if (type === 'string') {
      customAttributeRule[name] = Joi.string()
        .min(min || 0)
        .max(max || 255)
        .presence(required ? 'required' : 'optional');

      if (expectedValues) {
        customAttributeRule[name] = customAttributeRule[name].valid(...expectedValues);
      }
    }
  });
  const validationSchema = Joi.object({
    ...customAttributeRule,
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
