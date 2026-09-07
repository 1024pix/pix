import { config } from '../../../../../../config/config.js';
import { InvalidSessionResultTokenError } from '../../../../../shared/domain/errors.js';
import { tokenService } from '../../../../../shared/domain/services/token-service.js';

export class CertificationResultsLinkToken {
  constructor({ sessionId, scope }) {
    this.sessionId = sessionId;
    this.scope = scope;
  }

  static decode(token) {
    const decoded = tokenService.getDecodedToken(token, config.authentication.secret);

    if (!decoded) {
      throw new InvalidSessionResultTokenError();
    }

    if (!decoded.session_id) {
      throw new InvalidSessionResultTokenError();
    }

    if (decoded.scope !== config.jwtConfig.certificationResults.scope) {
      throw new InvalidSessionResultTokenError();
    }

    return new CertificationResultsLinkToken({ sessionId: decoded.session_id, scope: decoded.scope });
  }

  static generate({ sessionId }) {
    return tokenService.encodeToken(
      {
        session_id: sessionId,
        scope: config.jwtConfig.certificationResults.scope,
      },
      config.authentication.secret,
      config.jwtConfig.certificationResults.tokenLifespan,
    );
  }
}
