import Joi from 'joi';

import { EntityValidationError } from '../../../../shared/domain/errors.js';

const CLIENTS = ['PIX_ADMIN', 'PIX_APP'];
const ACTIONS = ['ANONYMIZATION', 'ANONYMIZATION_GAR', 'EMAIL_CHANGED'];
const ROLES = ['SUPER_ADMIN', 'SUPPORT', 'USER'];

const EventLogSchema = Joi.object({
  client: Joi.string()
    .valid(...CLIENTS)
    .required(),
  action: Joi.string()
    .valid(...ACTIONS)
    .required(),
  role: Joi.string()
    .valid(...ROLES)
    .required(),
  userId: Joi.number().required(),
  targetUserId: Joi.number().required(),
  data: Joi.object().optional(),
  occurredAt: Joi.date().optional(),
});

export class EventLoggingJob {
  constructor({ client, action, role, userId, targetUserId, data, occurredAt }) {
    this.client = client;
    this.action = action;
    this.role = role;
    this.userId = userId;
    this.targetUserId = targetUserId;
    this.data = data;
    this.occurredAt = occurredAt || new Date();

    this.#validate();
  }

  #validate() {
    const { error } = EventLogSchema.validate(this, { abortEarly: false });
    if (error) throw EntityValidationError.fromJoiErrors(error.details);
  }
}
