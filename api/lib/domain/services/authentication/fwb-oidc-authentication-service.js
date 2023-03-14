import { v4 as uuidv4 } from 'uuid';
import { config } from '../../../config.js';
import * as OidcAuthenticationService from './oidc-authentication-service.js';
import { temporaryStorage } from '../../../infrastructure/temporary-storage/index.js';

const logoutUrlTemporaryStorage = temporaryStorage.withPrefix('logout-url:');

class FwbOidcAuthenticationService extends OidcAuthenticationService {
  constructor() {
    super({
      source: 'fwb',
      identityProvider: 'FWB',
      slug: 'fwb',
      organizationName: 'Fédération Wallonie-Bruxelles',
      hasLogoutUrl: true,
      jwtOptions: { expiresIn: config.fwb.accessTokenLifespanMs / 1000 },
      clientSecret: config.fwb.clientSecret,
      clientId: config.fwb.clientId,
      tokenUrl: config.fwb.tokenUrl,
      authenticationUrl: config.fwb.authenticationUrl,
      authenticationUrlParameters: [{ key: 'scope', value: 'openid profile' }],
      userInfoUrl: config.fwb.userInfoUrl,
    });

    this.logoutUrl = config.fwb.logoutUrl;
    this.temporaryStorage = config.fwb.temporaryStorage;
  }

  async getRedirectLogoutUrl({ userId, logoutUrlUUID }) {
    const redirectTarget = new URL(this.logoutUrl);
    const key = `${userId}:${logoutUrlUUID}`;
    const idToken = await logoutUrlTemporaryStorage.get(key);
    const params = [{ key: 'id_token_hint', value: idToken }];

    params.forEach(({ key, value }) => redirectTarget.searchParams.append(key, value));

    await logoutUrlTemporaryStorage.delete(key);

    return redirectTarget.toString();
  }

  async saveIdToken({ idToken, userId }) {
    const uuid = uuidv4();
    const { idTokenLifespanMs } = this.temporaryStorage;

    await logoutUrlTemporaryStorage.save({
      key: `${userId}:${uuid}`,
      value: idToken,
      expirationDelaySeconds: idTokenLifespanMs / 1000,
    });

    return uuid;
  }
}

export { FwbOidcAuthenticationService };
