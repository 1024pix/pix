import Joi from 'joi';

import { config } from '../../../../config/config.js';
import { InvalidInputDataError } from '../../../shared/domain/errors.js';
import { tokenService, tokenType } from '../../../shared/domain/services/token-service.js';
import { validateEntity } from '../../../shared/domain/validators/entity-validator.js';

const expirationDelaySeconds = config.authentication.refreshTokenLifespanMs / 1000;

export class UserRefreshToken {
  constructor({ id, userId, sessionId, audience, source }) {
    this.id = id;
    this.userId = userId;
    this.sessionId = sessionId;
    this.audience = audience;
    this.source = source;

    validateEntity(
      Joi.object({
        id: Joi.string().guid({ version: 'uuidv4' }).required(),
        userId: Joi.number().required(),
        sessionId: Joi.string().required(),
        audience: Joi.string().required(),
        source: Joi.string().optional(),
      }),
      this,
    );
  }

  static generate({ userId, sessionId, audience, source }) {
    const id = crypto.randomUUID();
    return tokenService.encodeToken(
      { jti: id, user_id: userId, sid: sessionId, aud: audience, source },
      config.authentication.secret,
      expirationDelaySeconds,
      { type: tokenType.REFRESH_TOKEN },
    );
  }

  static decode(encodedRefreshToken) {
    const decodedRefreshToken = tokenService.getDecodedToken(encodedRefreshToken, config.authentication.secret, {
      expectedType: tokenType.REFRESH_TOKEN,
    });
    if (!decodedRefreshToken) throw new InvalidInputDataError('Refresh token verify fail', 'INVALID_REFRESH_TOKEN');

    return new UserRefreshToken({
      id: decodedRefreshToken.jti,
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
