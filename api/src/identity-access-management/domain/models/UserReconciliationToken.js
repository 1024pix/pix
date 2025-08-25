import { config } from '../../../shared/config.js';
import { InvalidExternalUserTokenError } from '../../../shared/domain/errors.js';
import { tokenService } from '../../../shared/domain/services/token-service.js';

export class UserReconciliationToken {
  constructor({ firstName, lastName, samlId }) {
    this.firstName = firstName;
    this.lastName = lastName;
    this.samlId = samlId;
  }

  static decode(token) {
    const decoded = tokenService.getDecodedToken(token, config.authentication.secret);

    if (!decoded) {
      throw new InvalidExternalUserTokenError(
        'Une erreur est survenue. Veuillez réessayer de vous connecter depuis le médiacentre.',
      );
    }

    return new UserReconciliationToken({
      firstName: decoded.first_name,
      lastName: decoded.last_name,
      samlId: decoded.saml_id,
    });
  }

  static generate({ firstName, lastName, samlId }) {
    return tokenService.encodeToken(
      {
        first_name: firstName,
        last_name: lastName,
        saml_id: samlId,
      },
      config.authentication.secret,
      { expiresIn: config.authentication.tokenForStudentReconciliationLifespan },
    );
  }
}
