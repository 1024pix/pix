import Joi from 'joi';

import { Event } from '../../../../lib/domain/events/Event.js';
import { PIX_ADMIN } from '../../../authorization/domain/constants.js';
import { validateEntity } from '../../../shared/domain/validators/entity-validator.js';

const { ROLES } = PIX_ADMIN;

export class GarAuthenticationMethodAnonymized extends Event {
  constructor({ userIds, updatedByUserId, client = 'PIX_ADMIN', role = ROLES.SUPER_ADMIN }) {
    super();

    this.userIds = userIds;
    this.updatedByUserId = updatedByUserId;
    this.client = client;
    this.occurredAt = new Date();
    this.role = role;

    validateEntity(SCHEMA, this);
  }
}

const SCHEMA = Joi.object({
  userIds: Joi.array().items(Joi.number().integer()).required(),
  updatedByUserId: Joi.number().integer().required(),
  client: Joi.string().valid('PIX_ADMIN').required(),
  occurredAt: Joi.date().required(),
  role: Joi.string().valid(ROLES.SUPER_ADMIN).required(),
});
