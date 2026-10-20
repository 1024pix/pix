import Joi from 'joi';

import { config } from '../../../../config/config.js';
import { InvalidInputDataError } from '../../../shared/domain/errors.js';
import { tokenService } from '../../../shared/domain/services/token-service.js';
import { validateEntity } from '../../../shared/domain/validators/entity-validator.js';

export class LtiPrescriberAccessToken {
  constructor({ organizationIds, clientId, deepLinkingSettings, scope, audience, sessionId }) {
    this.organizationIds = organizationIds;
    this.clientId = clientId;
    this.deepLinkingSettings = deepLinkingSettings;
    this.scope = scope;
    this.audience = audience;
    this.sessionId = sessionId;

    validateEntity(
      Joi.object({
        organizationIds: Joi.array().items(Joi.number()).required(),
        clientId: Joi.string().required(),
        deepLinkingSettings: Joi.object().required(),
        scope: Joi.string().required(),
        audience: Joi.string().required(),
        sessionId: Joi.string().required(),
      }),
      this,
    );
  }

  static decode(accessToken) {
    // FIXME expectedAudience
    const decoded = tokenService.getDecodedToken(accessToken, config.authentication.secret);
    if (!decoded) throw new InvalidInputDataError();

    return new LtiPrescriberAccessToken({
      organizationIds: decoded.organizationIds,
      clientId: decoded.clientId,
      deepLinkingSettings: decoded['https://purl.imsglobal.org/spec/lti-dl/claim/deep_linking_settings'],
      scope: decoded.scope,
      audience: decoded.aud,
      sessionId: decoded.sid,
    });
  }

  static generate({ organizationIds, clientId, deepLinkingSettings, scope, audience, sessionId }) {
    return tokenService.encodeToken(
      {
        organizationIds, // FIXME rename
        clientId, // FIXME rename to client_id? see https://www.rfc-editor.org/info/rfc8693/#section-4.3
        ['https://purl.imsglobal.org/spec/lti-dl/claim/deep_linking_settings']: deepLinkingSettings,
        scope,
        aud: audience,
        sid: sessionId,
      },
      config.authentication.secret,
      config.lti.prescriberAccessTokenLifespan,
    );
  }
}
