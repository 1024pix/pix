import Joi from 'joi';

import { PIX_ADMIN } from '../../../authorization/domain/constants.js';
import { validateEntity } from '../../../shared/domain/validators/entity-validator.js';

const { ROLES } = PIX_ADMIN;

// Todo rename on UserAnonymizedEventLoggingJob in order to erase Event logging context
export class UserAnonymizedEventLoggingJob {
  constructor({ userId, updatedByUserId, client = 'PIX_ADMIN', role }) {
    this.userId = userId;
    this.updatedByUserId = updatedByUserId;
    this.client = client;
    this.occurredAt = new Date();
    this.role = role;

    validateEntity(USER_ANONYMIZED_SCHEMA, this);
  }
}

const USER_ANONYMIZED_SCHEMA = Joi.object({
  userId: Joi.number().integer().required(),
  updatedByUserId: Joi.number().integer().required(),
  client: Joi.string().valid('PIX_ADMIN').required(),
  occurredAt: Joi.date().required(),
  role: Joi.string().valid(ROLES.SUPER_ADMIN, ROLES.SUPPORT).required(),
});
