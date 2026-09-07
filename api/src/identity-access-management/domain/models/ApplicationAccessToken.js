import { config } from '../../../../config/config.js';
import { tokenService } from '../../../shared/domain/services/token-service.js';

export class ApplicationAccessToken {
  constructor({ clientId, source, scope }) {
    this.clientId = clientId;
    this.source = source;
    this.scope = scope;
  }

  static decode(token, secret = config.authentication.secret) {
    const decoded = tokenService.getDecodedToken(token, secret);
    if (!decoded) return new ApplicationAccessToken({});

    return new ApplicationAccessToken({ clientId: decoded.client_id, source: decoded.source, scope: decoded.scope });
  }

  static generate({ clientId, source, scope }) {
    return tokenService.encodeToken(
      {
        client_id: clientId,
        source,
        scope: Array.isArray(scope) ? scope.join(' ') : scope,
      },
      config.authentication.secret,
      config.authentication.accessTokenLifespanMs,
    );
  }
}
