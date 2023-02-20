import Joi from 'joi';
import { schema as base } from './base-validation';
import { EntityValidationError } from '../../errors';

const schema = base.keys({
  description: Joi.string().allow(null),
  comment: Joi.string().allow(null),
  isPublic: Joi.boolean().required(),
  imageUrl: Joi.string().allow(null),
  ownerOrganizationId: Joi.number().allow(null).default(null),
  tubes: Joi.array()
    .items({
      id: Joi.string().required(),
      level: Joi.number().required(),
    })
    .min(1)
    .required(),
});

function validate(creationCommand) {
  const { error } = schema.validate(creationCommand, { abortEarly: false, allowUnknown: true });
  if (error) {
    throw EntityValidationError.fromJoiErrors(error.details);
  }
  return true;
}

export default {
  validate,
};
