import { stringifySetCookie } from 'cookie';
import Joi from 'joi';
import ms from 'ms';

import { config } from '../../../../config/config.js';
import { InvalidInputDataError } from '../../../shared/domain/errors.js';
import { tokenService, tokenType } from '../../../shared/domain/services/token-service.js';
import { validateEntity } from '../../../shared/domain/validators/entity-validator.js';

const COOKIE_NAME = 'ltiUser';

const COOKIE_CONFIG = Object.freeze({
  name: COOKIE_NAME,
  secure: true,
  httpOnly: true,
  sameSite: 'strict',
  path: '/api/campaign-participations',
  maxAge: ms(config.lti.ltiUserTokenLifespan) / 1000,
});

export class LtiUserToken {
  /**
   * @param {object} args
   * @param {string} args.userSub
   * @param {string} args.clientId
   */
  constructor({ userSub, clientId }) {
    this.userSub = userSub;
    this.clientId = clientId;

    validateEntity(
      Joi.object({
        userSub: Joi.string().required(),
        clientId: Joi.string().required(),
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
        'https://pix.org/claims/lti-sub': this.userSub,
        'https://pix.org/claims/lti-client-id': this.clientId,
      },
      config.authentication.secret,
      config.lti.ltiUserTokenLifespan,
      { type: tokenType.JWT },
    );
  }

  /**
   * @param {string} token
   * @returns {LtiUserToken}
   * @throws {InvalidInputDataError} when the token is invalid, expired or not an LTI user token
   */
  static decode(token) {
    const decoded = tokenService.getDecodedToken(token, config.authentication.secret, {
      expectedType: tokenType.JWT,
    });
    if (!decoded) throw new InvalidInputDataError();

    return new LtiUserToken({
      userSub: decoded['https://pix.org/claims/lti-sub'],
      clientId: decoded['https://pix.org/claims/lti-client-id'],
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
}
