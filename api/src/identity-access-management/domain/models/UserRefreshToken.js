import Joi from 'joi';

import { config } from '../../../shared/config.js';
import { InvalidInputDataError } from '../../../shared/domain/errors.js';
import { tokenService } from '../../../shared/domain/services/token-service.js';
import { validateEntity } from '../../../shared/domain/validators/entity-validator.js';

export class UserRefreshToken {
  constructor({ userId, audience, sessionId, source }) {
    this.userId = userId;
    this.audience = audience;
    this.sessionId = sessionId;
    this.source = source;

    validateEntity(
      Joi.object({
        userId: Joi.number().required(),
        audience: Joi.string().required(),
        sessionId: Joi.string().required(),
        source: Joi.string().optional(),
      }),
      this,
    );
  }

  static generate({ userId, source, audience, sessionId }) {
    const expirationDelaySeconds = config.authentication.refreshTokenLifespanMs / 1000;
    return tokenService.encodeToken(
      { user_id: userId, source, aud: audience, sid: sessionId },
      config.authentication.secret,
      expirationDelaySeconds,
    );
  }

  static decode(encodedRefreshToken) {
    const decodedRefreshToken = tokenService.getDecodedToken(encodedRefreshToken, config.authentication.secret);
    if (!decodedRefreshToken) throw new InvalidInputDataError();

    return new UserRefreshToken({
      userId: decodedRefreshToken.user_id,
      source: decodedRefreshToken.source,
      audience: decodedRefreshToken.aud,
      sessionId: decodedRefreshToken.sid,
    });
  }

  hasSameAudience(audience) {
    return this.audience === audience;
  }
}
