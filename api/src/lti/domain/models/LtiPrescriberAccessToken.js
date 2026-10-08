import Joi from 'joi';

import { config } from '../../../../config/config.js';
import { InvalidInputDataError } from '../../../shared/domain/errors.js';
import { tokenService } from '../../../shared/domain/services/token-service.js';
import { validateEntity } from '../../../shared/domain/validators/entity-validator.js';

export class LtiPrescriberAccessToken {
  constructor({ organizationIds, scope, audience, sessionId }) {
    this.organizationIds = organizationIds;
    this.scope = scope;
    this.audience = audience;
    this.sessionId = sessionId;

    validateEntity(
      Joi.object({
        organizationIds: Joi.array().items(Joi.number()).required(),
        scope: Joi.string().required(),
        audience: Joi.string().required(),
        sessionId: Joi.string().required(),
      }),
      this,
    );
  }

  static decode(accessToken) {
    const decoded = tokenService.getDecodedToken(accessToken, config.authentication.secret);
    if (!decoded) throw new InvalidInputDataError();

    return new LtiPrescriberAccessToken({
      organizationIds: decoded.user_id,
      scope: decoded.scope,
      audience: decoded.aud,
      sessionId: decoded.sid,
    });
  }

  static generate({ organizationIds, scope, audience, sessionId }) {
    return tokenService.encodeToken(
      { organizationIds, scope, aud: audience, sid: sessionId },
      config.authentication.secret,
      config.lti.prescriberAccessTokenLifespan,
    );
  }
}
