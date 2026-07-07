import Joi from 'joi';

import { config } from '../../../shared/config.js';
import { InvalidInputDataError } from '../../../shared/domain/errors.js';
import { tokenService } from '../../../shared/domain/services/token-service.js';
import { validateEntity } from '../../../shared/domain/validators/entity-validator.js';

export class UserAccessToken {
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

  static decode(accessToken) {
    const decoded = tokenService.getDecodedToken(accessToken, config.authentication.secret);
    if (!decoded) throw new InvalidInputDataError();

    return new UserAccessToken({
      userId: decoded.user_id,
      source: decoded.source,
      audience: decoded.aud,
      sessionId: decoded.sid,
    });
  }

  static generateUserToken({ userId, source, audience, sessionId }) {
    const expirationDelaySeconds = config.authentication.accessTokenLifespanMs / 1000;
    const accessToken = UserAccessToken.generate({ userId, source, audience, expirationDelaySeconds, sessionId });
    return { accessToken, expirationDelaySeconds };
  }

  static generateAnonymousUserToken({ userId, audience, sessionId }) {
    const expirationDelaySeconds = config.anonymous.accessTokenLifespanMs / 1000;
    const accessToken = UserAccessToken.generate({
      userId,
      source: 'pix',
      audience,
      expirationDelaySeconds,
      sessionId,
    });
    return { accessToken, expirationDelaySeconds };
  }

  static generateSamlUserToken({ userId, audience, sessionId }) {
    const expirationDelaySeconds = config.saml.accessTokenLifespanMs / 1000;
    const accessToken = UserAccessToken.generate({
      userId,
      source: 'external',
      audience,
      expirationDelaySeconds,
      sessionId,
    });
    return { accessToken, expirationDelaySeconds };
  }

  /**
   * @param {number} userId
   * @param {string} audience
   * @param {string} sessionId
   * @param {number|string} expiresIn expressed in seconds or a string describing a time span, 60, ex. "2 days", "10h", "7d"
   * @returns {Object} containing the accessToken and the expirationDelaySeconds
   */
  static generateOidcUserToken({ userId, audience, sessionId, expiresIn }) {
    const accessToken = UserAccessToken.generate({ userId, audience, sessionId, expirationDelaySeconds: expiresIn });
    return { accessToken, expirationDelaySeconds: expiresIn };
  }

  static generate({ userId, source, audience, expirationDelaySeconds, sessionId }) {
    return tokenService.encodeToken(
      { user_id: userId, source, aud: audience, sid: sessionId },
      config.authentication.secret,
      expirationDelaySeconds,
    );
  }
}
