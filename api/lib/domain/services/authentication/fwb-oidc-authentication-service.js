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
      additionalRequiredProperties: ['logoutUrl'],
      authenticationUrl: config[configKey].authenticationUrl,
      claimsToStore: config[configKey].claimsToStore,
      clientId: config[configKey].clientId,
      clientSecret: config[configKey].clientSecret,
      configKey,
      hasLogoutUrl: true,
      identityProvider: FWB.code,
      jwtOptions: { expiresIn: config[configKey].accessTokenLifespanMs / 1000 },
      organizationName: 'Fédération Wallonie-Bruxelles',
      redirectUri: config[configKey].redirectUri,
      slug: 'fwb',
      source: 'fwb',
      tokenUrl: config[configKey].tokenUrl,
      userInfoUrl: config[configKey].userInfoUrl,
      openidConfigurationUrl: config[configKey].openidConfigurationUrl,
    });

    this.logoutUrl = config[configKey].logoutUrl;
    this.temporaryStorageConfig = config[configKey].temporaryStorage;
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
    const uuid = randomUUID();
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
