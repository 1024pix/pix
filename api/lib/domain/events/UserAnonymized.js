import Joi from 'joi';

import { PIX_ADMIN } from '../../../src/authorization/domain/constants.js';
import { validateEntity } from '../../../src/shared/domain/validators/entity-validator.js';
import { Event } from './Event.js';

const { ROLES } = PIX_ADMIN;

export class UserAnonymized extends Event {
  constructor({ userId, updatedByUserId, client = 'PIX_ADMIN', role }) {
    super();

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
