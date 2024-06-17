import Joi from 'joi';

import { EntityValidationError } from '../../../../shared/domain/errors.js';

const complementaryCertificationHabilitationSchema = Joi.object({
  id: Joi.number().required(),
  key: Joi.string().required(),
  label: Joi.string().required(),
});

const validate = function (center) {
  const { error } = complementaryCertificationHabilitationSchema.validate(center, { allowUnknown: false });
  if (error) {
    throw EntityValidationError.fromJoiErrors(error.details);
  }
};

export { validate };
