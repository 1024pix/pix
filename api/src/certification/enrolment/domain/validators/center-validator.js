import Joi from 'joi';

import { EntityValidationError } from '../../../../shared/domain/errors.js';
import { CERTIFICATION_FEATURES } from '../../../shared/domain/constants.js';
import { CenterTypes } from '../models/CenterTypes.js';
import { Habilitation } from '../models/Habilitation.js';

const centerSchema = Joi.object({
  id: Joi.number().optional(),
  name: Joi.string().required(),
  externalId: Joi.string().optional().allow(null).allow(''),
  isV3Pilot: Joi.boolean().required(),
  type: Joi.string()
    .required()
    .valid(...Object.values(CenterTypes)),
  habilitations: Joi.array().items(Joi.object().instance(Habilitation)).required(),
  features: Joi.array()
    .items(Joi.string().valid(...Object.keys(CERTIFICATION_FEATURES)))
    .required(),
});

const validate = function (center) {
  const { error } = centerSchema.validate(center, { allowUnknown: false });
  if (error) {
    throw EntityValidationError.fromJoiErrors(error.details);
  }
};

export { validate };
