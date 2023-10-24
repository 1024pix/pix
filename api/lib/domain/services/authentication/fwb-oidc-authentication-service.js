import { randomUUID } from 'crypto';
import { config } from '../../../config.js';
import { OidcAuthenticationService } from './oidc-authentication-service.js';
import { temporaryStorage } from '../../../infrastructure/temporary-storage/index.js';
import { FWB } from '../../constants/oidc-identity-providers.js';

const configKey = FWB.configKey;
const logoutUrlTemporaryStorage = temporaryStorage.withPrefix('logout-url:');

class FwbOidcAuthenticationService extends OidcAuthenticationService {
  constructor() {
    super({
      identityProvider: FWB.code,
      configKey,
      source: 'fwb',
      slug: 'fwb',
      organizationName: 'Fédération Wallonie-Bruxelles',
      additionalRequiredProperties: ['logoutUrl'],
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
    this.temporaryStorageConfig = config.fwb.temporaryStorage;
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
    // The session ID must be unpredictable, thus we disable the entropy cache
    // See https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html#session-id-entropy
    const uuid = randomUUID({ disableEntropyCache: true });
    const { idTokenLifespanMs } = this.temporaryStorageConfig;

    await logoutUrlTemporaryStorage.save({
      key: `${userId}:${uuid}`,
      value: idToken,
      expirationDelaySeconds: idTokenLifespanMs / 1000,
    });

    return uuid;
  }
}

export { FwbOidcAuthenticationService };
