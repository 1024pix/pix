import { OidcAuthenticationService } from '../../../../src/authentication/domain/services/oidc-authentication-service.js';
import { logger } from '../../../../src/shared/infrastructure/utils/logger.js';

export class FwbOidcAuthenticationService extends OidcAuthenticationService {
  constructor(oidcProvider, dependencies) {
    super(oidcProvider, dependencies);

    if (!oidcProvider.additionalRequiredProperties) {
      this.isReady = false;
      logger.error(
        `OIDC Provider "${this.identityProvider}" has been DISABLED because of missing "additionalRequiredProperties" object.`,
      );
      return;
    }

    this.logoutUrl = oidcProvider.additionalRequiredProperties.logoutUrl;
  }

  async getRedirectLogoutUrl({ userId, logoutUrlUUID }) {
    const redirectTarget = new URL(this.logoutUrl);
    const key = `${userId}:${logoutUrlUUID}`;
    const idToken = this.sessionTemporaryStorage.get(key);

    const params = [{ key: 'id_token_hint', value: idToken }];

    params.forEach(({ key, value }) => redirectTarget.searchParams.append(key, value));

    await this.sessionTemporaryStorage.delete(key);

    return redirectTarget.toString();
  }
}
