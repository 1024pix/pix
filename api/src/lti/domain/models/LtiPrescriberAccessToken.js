import { stringifySetCookie } from 'cookie';
import Joi from 'joi';

import { config } from '../../../../config/config.js';
import { InvalidInputDataError } from '../../../shared/domain/errors.js';
import { tokenService } from '../../../shared/domain/services/token-service.js';
import { validateEntity } from '../../../shared/domain/validators/entity-validator.js';

const COOKIE_NAME = 'jwtLtiPrescriber';

const COOKIE_CONFIG = Object.freeze({
  name: COOKIE_NAME,
  secure: true,
  httpOnly: true,
  sameSite: 'none',
  partitioned: true,
  path: '/api/lti',
});

export class LtiPrescriberAccessToken {
  /**
   * @param {object} args
   * @param {number[]} args.organizationIds
   * @param {string} args.clientId
   * @param {object} args.deepLinkingSettings
   * @param {string} args.scope
   * @param {string} args.audience
   * @param {string} args.sessionId
   */
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

  get encodedForSetCookieHeader() {
    return stringifySetCookie({
      ...COOKIE_CONFIG,
      value: this.encoded,
    });
  }

  get encoded() {
    return tokenService.encodeToken(
      {
        organizationIds: this.organizationIds, // FIXME rename
        client_id: this.clientId,
        ['https://purl.imsglobal.org/spec/lti-dl/claim/deep_linking_settings']: this.deepLinkingSettings,
        scope: this.scope,
        aud: this.audience,
        sid: this.sessionId,
      },
      config.authentication.secret,
      config.lti.prescriberAccessTokenLifespan,
    );
  }

  /**
   * @param {string} accessToken
   * @param {object} options
   * @param {string=} options.expectedAudience
   */
  static decode(accessToken, { expectedAudience } = {}) {
    const decoded = tokenService.getDecodedToken(accessToken, config.authentication.secret, { expectedAudience });
    if (!decoded) throw new InvalidInputDataError();

    return new LtiPrescriberAccessToken({
      organizationIds: decoded.organizationIds,
      clientId: decoded.client_id,
      deepLinkingSettings: decoded['https://purl.imsglobal.org/spec/lti-dl/claim/deep_linking_settings'],
      scope: decoded.scope,
      audience: decoded.aud,
      sessionId: decoded.sid,
    });
  }

  static setCookieHeaderForClearing() {
    return stringifySetCookie({
      ...COOKIE_CONFIG,
      value: '',
      maxAge: -1,
    });
  }

  static get cookieName() {
    return COOKIE_NAME;
  }

  /**
   * @deprecated
   */
  static generate({ organizationIds, clientId, deepLinkingSettings, scope, audience, sessionId }) {
    return new LtiPrescriberAccessToken({
      organizationIds,
      clientId,
      deepLinkingSettings,
      scope,
      audience,
      sessionId,
    }).encode();
  }
}
