import Joi from 'joi';

import { config } from '../../../../config/config.js';
import { InvalidInputDataError } from '../../../shared/domain/errors.js';
import { tokenService } from '../../../shared/domain/services/token-service.js';
import { validateEntity } from '../../../shared/domain/validators/entity-validator.js';

const expirationDelaySeconds = config.authentication.refreshTokenLifespanMs / 1000;

export class UserRefreshToken {
  constructor({ userId, sessionId, audience, source }) {
    this.userId = userId;
    this.sessionId = sessionId;
    this.audience = audience;
    this.source = source;

    validateEntity(
      Joi.object({
        userId: Joi.number().required(),
        sessionId: Joi.string().required(),
        audience: Joi.string().required(),
        source: Joi.string().optional(),
      }),
      this,
    );
  }

  static generate({ userId, sessionId, audience, source }) {
    return tokenService.encodeToken(
      { user_id: userId, sid: sessionId, aud: audience, source },
      config.authentication.secret,
      expirationDelaySeconds,
    );
  }

  static decode(encodedRefreshToken) {
    const decodedRefreshToken = tokenService.getDecodedToken(encodedRefreshToken, config.authentication.secret);
    if (!decodedRefreshToken) throw new InvalidInputDataError('Refresh token verify fail', 'INVALID_REFRESH_TOKEN');

    return new UserRefreshToken({
      userId: decodedRefreshToken.user_id,
      sessionId: decodedRefreshToken.sid,
      audience: decodedRefreshToken.aud,
      source: decodedRefreshToken.source,
    });
  }

  assertSameAudience(audience) {
    if (audience !== this.audience) {
      throw new InvalidInputDataError(
        `Refresh token audience mismatch ${audience} != ${this.audience}`,
        'INVALID_REFRESH_TOKEN',
      );
    }
  }
}
