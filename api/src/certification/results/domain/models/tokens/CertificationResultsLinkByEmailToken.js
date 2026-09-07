import { config } from '../../../../../../config/config.js';
import { InvalidResultRecipientTokenError } from '../../../../../shared/domain/errors.js';
import { tokenService } from '../../../../../shared/domain/services/token-service.js';

const CERTIFICATION_RESULTS_BY_RECIPIENT_EMAIL_LINK_SCOPE = 'certificationResultsByRecipientEmailLink';

export class CertificationResultsLinkByEmailToken {
  constructor({ sessionId, resultRecipientEmail, scope }) {
    this.sessionId = sessionId;
    this.resultRecipientEmail = resultRecipientEmail;
    this.scope = scope;
  }

  static decode(token) {
    const decoded = tokenService.getDecodedToken(token, config.authentication.secret);

    if (!decoded) {
      throw new InvalidResultRecipientTokenError();
    }

    if (!decoded.session_id || !decoded.result_recipient_email) {
      throw new InvalidResultRecipientTokenError();
    }

    if (decoded.scope !== CERTIFICATION_RESULTS_BY_RECIPIENT_EMAIL_LINK_SCOPE) {
      throw new InvalidResultRecipientTokenError();
    }

    return new CertificationResultsLinkByEmailToken({
      sessionId: decoded.session_id,
      resultRecipientEmail: decoded.result_recipient_email,
      scope: decoded.scope,
    });
  }

  static generate({ sessionId, resultRecipientEmail, daysBeforeExpiration }) {
    return tokenService.encodeToken(
      {
        session_id: sessionId,
        result_recipient_email: resultRecipientEmail,
        scope: CERTIFICATION_RESULTS_BY_RECIPIENT_EMAIL_LINK_SCOPE,
      },
      config.authentication.secret,
      `${daysBeforeExpiration}d`,
    );
  }
}
