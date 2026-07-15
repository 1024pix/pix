import { config } from '../../../shared/config.js';
import { InvalidInputDataError } from '../../../shared/domain/errors.js';
import { tokenService } from '../../../shared/domain/services/token-service.js';

export class UserAccessToken {
  constructor({ userId, source, audience }) {
    this.userId = userId;
    this.source = source;
    this.audience = audience;
  }

  static decode(accessToken) {
    const decoded = tokenService.getDecodedToken(accessToken, config.authentication.secret);
    if (!decoded) throw new InvalidInputDataError();

    return new UserAccessToken({ userId: decoded.user_id, source: decoded.source, audience: decoded.aud });
  }

  static generateUserToken({ userId, source, audience }) {
    const expirationDelaySeconds = config.authentication.accessTokenLifespanMs / 1000;
    const accessToken = UserAccessToken.generate({ userId, source, audience, expirationDelaySeconds });
    return { accessToken, expirationDelaySeconds };
  }

  static generateAnonymousUserToken({ userId, audience }) {
    const expirationDelaySeconds = config.anonymous.accessTokenLifespanMs / 1000;
    const accessToken = UserAccessToken.generate({ userId, source: 'pix', audience, expirationDelaySeconds });
    return { accessToken, expirationDelaySeconds };
  }

  static generateSamlUserToken({ userId, audience }) {
    const expirationDelaySeconds = config.saml.accessTokenLifespanMs / 1000;
    const accessToken = UserAccessToken.generate({ userId, source: 'external', audience, expirationDelaySeconds });
    return { accessToken, expirationDelaySeconds };
  }

  static generate({ userId, source, audience, expirationDelaySeconds }) {
    return tokenService.encodeToken(
      { user_id: userId, source, aud: audience },
      config.authentication.secret,
      expirationDelaySeconds,
    );
  }
}
