import crypto from 'node:crypto';

import Joi from 'joi';

import { config } from '../../../shared/config.js';
import { validateEntity } from '../../../shared/domain/validators/entity-validator.js';

const SEPARATOR = ':';

export class RefreshToken {
  constructor({ userId, value, audience, sessionId, source }) {
    this.userId = userId;
    this.value = value;
    this.audience = audience;
    this.sessionId = sessionId;
    this.source = source;

    validateEntity(
      Joi.object({
        userId: Joi.number().required(),
        value: Joi.string().required(),
        audience: Joi.string().required(),
        sessionId: Joi.string().required(),
        source: Joi.string().optional(),
      }),
      this,
    );
  }

  static generate({ userId, source, audience, sessionId }) {
    const uuid = crypto.randomUUID();
    const value = [userId, uuid].filter(Boolean).join(SEPARATOR);
    return new RefreshToken({ userId, source, value, audience, sessionId });
  }

  get expirationDelaySeconds() {
    return config.authentication.refreshTokenLifespanMs / 1000;
  }

  hasSameAudience(audience) {
    return this.audience === audience;
  }
}
