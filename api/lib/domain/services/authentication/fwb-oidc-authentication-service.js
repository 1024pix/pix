const { v4: uuidv4 } = require('uuid');
const settings = require('../../../config.js');
const OidcAuthenticationService = require('./oidc-authentication-service.js');
const { temporaryStorage } = require('../../../infrastructure/temporary-storage/index.js');

const logoutUrlTemporaryStorage = temporaryStorage.withPrefix('logout-url:');

class FwbOidcAuthenticationService extends OidcAuthenticationService {
  constructor() {
    super({
      source: 'fwb',
      identityProvider: 'FWB',
      slug: 'fwb',
      organizationName: 'Fédération Wallonie-Bruxelles',
      hasLogoutUrl: true,
      jwtOptions: { expiresIn: settings.fwb.accessTokenLifespanMs / 1000 },
      clientSecret: settings.fwb.clientSecret,
      clientId: settings.fwb.clientId,
      tokenUrl: settings.fwb.tokenUrl,
      authenticationUrl: settings.fwb.authenticationUrl,
      authenticationUrlParameters: [{ key: 'scope', value: 'openid profile' }],
      userInfoUrl: settings.fwb.userInfoUrl,
    });

    this.logoutUrl = settings.fwb.logoutUrl;
    this.temporaryStorage = settings.fwb.temporaryStorage;
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

module.exports = FwbOidcAuthenticationService;
