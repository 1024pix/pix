import { OidcAuthenticationService } from '../../../../src/authentication/domain/services/oidc-authentication-service.js';
import { temporaryStorage } from '../../../infrastructure/temporary-storage/index.js';

const logoutUrlTemporaryStorage = temporaryStorage.withPrefix('logout-url:');

export class FwbOidcAuthenticationService extends OidcAuthenticationService {
  constructor(oidcProvider, dependencies) {
    super(oidcProvider, dependencies);

    this.logoutUrl = oidcProvider.additionalRequiredProperties.logoutUrl;
  }

  async getRedirectLogoutUrl({ userId, logoutUrlUUID }) {
    const redirectTarget = new URL(this.logoutUrl);
    const key = `${userId}:${logoutUrlUUID}`;

    let idToken = await logoutUrlTemporaryStorage.get(key);
    if (!idToken) {
      idToken = this.sessionTemporaryStorage.get(key);
    }

    const params = [{ key: 'id_token_hint', value: idToken }];

    params.forEach(({ key, value }) => redirectTarget.searchParams.append(key, value));

    await logoutUrlTemporaryStorage.delete(key);
    await this.sessionTemporaryStorage.delete(key);

    return redirectTarget.toString();
  }
}
