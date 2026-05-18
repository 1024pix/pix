import JoiDate from '@joi/date';
import BaseJoi from 'joi';

import { ModelValidationError } from '../../../../shared/domain/errors.js';
const Joi = BaseJoi.extend(JoiDate);

const validationConfiguration = { allowUnknown: true, abortEarly: false };

function buildStringSchema({ required, min, max, length, regexp } = {}) {
  let schema = Joi.string().empty(['', null]);
  if (length) {
    schema = schema.length(length);
  }

  if (min) {
    schema = schema.min(min);
  }

  if (max) {
    schema = schema.max(max);
  }

  if (regexp) {
    schema = schema.pattern(new RegExp(regexp.slice(1, -1)));
  }
  if (required !== undefined) {
    schema = schema.presence(required ? 'required' : 'optional');
  }
  return schema;
}

const validateGenericOrganizationLearner = function (commonOrganizationLearner, validationFormatRules) {
  const customAttributeRule = {};
  validationFormatRules?.forEach(
    ({ name, type, format, required, min, max, length, regexp, expectedValues, conditional }) => {
      if (type === 'date') {
        customAttributeRule[name] = Joi.date()
          .format(format)
          .presence(required ? 'required' : 'optional');
      }

      if (type === 'string') {
        if (conditional) {
          customAttributeRule[name] = Joi.when(conditional.when, {
            is: conditional.is,
            then: buildStringSchema(conditional.then),
            otherwise: buildStringSchema(conditional.otherwise),
          });
        } else {
          customAttributeRule[name] = buildStringSchema({ required, min, max, length, regexp });

          if (expectedValues) {
            customAttributeRule[name] = customAttributeRule[name].valid(...expectedValues);
          }
        }
      }
    },
  );
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

export { validateGenericOrganizationLearner };
