import JoiDate from '@joi/date';
import BaseJoi from 'joi';
const Joi = BaseJoi.extend(JoiDate);

const validationConfiguration = { allowUnknown: true, abortEarly: false };

const validateCommonOrganizationLearner = function (commonOrganizationLearner, validationRules) {
  const attributeRule = {};
  validationRules.forEach(({ name, type, format, required }) => {
    if (type === 'date') {
      attributeRule[name] = Joi.date()
        .format(format)
        .presence(required ? 'required' : 'optional');
    }
  });
  const validationSchema = Joi.object({
    attributes: Joi.object(attributeRule).required().empty(null),
  });

  const { error: validationErrors } = validationSchema.validate(commonOrganizationLearner, validationConfiguration);
  return validationErrors ? validationErrors.details : [];
};

export { validateCommonOrganizationLearner };
