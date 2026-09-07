import { config } from '../../../../config/config.js';
import { tokenService } from '../../../shared/domain/services/token-service.js';

export class PasswordExpirationToken {
  constructor({ userId }) {
    this.userId = userId;
  }

  static decode(token) {
    const decoded = tokenService.getDecodedToken(token, config.authentication.secret);
    if (!decoded) return new PasswordExpirationToken({});

    return new PasswordExpirationToken({ userId: decoded.user_id });
  }

  static generate({ userId }) {
    return tokenService.encodeToken(
      { user_id: userId },
      config.authentication.secret,
      config.authentication.passwordResetTokenLifespan,
    );
  }
}
