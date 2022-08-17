const settings = require('../../../config');
const OidcAuthenticationService = require('./oidc-authentication-service');
const DomainTransaction = require('../../../infrastructure/DomainTransaction');
const AuthenticationMethod = require('../../models/AuthenticationMethod');
const moment = require('moment');
const { v4: uuidv4 } = require('uuid');
const logoutUrlTemporaryStorage = require('../../../infrastructure/temporary-storage').withPrefix('logout-url:');

class PoleEmploiOidcAuthenticationService extends OidcAuthenticationService {
  constructor() {
    const source = 'pole_emploi_connect';
    const identityProvider = 'POLE_EMPLOI';
    const expirationDelaySeconds = settings.poleEmploi.accessTokenLifespanMs / 1000;
    const jwtOptions = { expiresIn: expirationDelaySeconds };
    const clientSecret = settings.poleEmploi.clientSecret;
    const clientId = settings.poleEmploi.clientId;
    const tokenUrl = settings.poleEmploi.tokenUrl;
    const authenticationUrl = settings.poleEmploi.authenticationUrl;
    const authenticationUrlParameters = [
      { key: 'realm', value: '/individu' },
      {
        key: 'scope',
        value: `application_${clientId} api_peconnect-individuv1 openid profile`,
      },
    ];
    const userInfoUrl = settings.poleEmploi.userInfoUrl;

    super({
      source,
      identityProvider,
      jwtOptions,
      clientSecret,
      clientId,
      tokenUrl,
      authenticationUrl,
      authenticationUrlParameters,
      userInfoUrl,
    });

    this.logoutUrl = settings.poleEmploi.logoutUrl;
    this.afterLogoutUrl = settings.poleEmploi.afterLogoutUrl;
    this.temporaryStorage = settings.poleEmploi.temporaryStorage;
  }

  // Override because we need idToken to send results after a campaign
  // Sending campaign results is specific to Pole Emploi
  async createUserAccount({
    user,
    sessionContent,
    externalIdentityId,
    userToCreateRepository,
    authenticationMethodRepository,
  }) {
    let createdUserId;
    await DomainTransaction.execute(async (domainTransaction) => {
      createdUserId = (await userToCreateRepository.create({ user, domainTransaction })).id;

      const authenticationMethod = new AuthenticationMethod({
        identityProvider: AuthenticationMethod.identityProviders.POLE_EMPLOI,
        userId: createdUserId,
        externalIdentifier: externalIdentityId,
        authenticationComplement: this.createAuthenticationComplement({ sessionContent }),
      });
      await authenticationMethodRepository.create({ authenticationMethod, domainTransaction });
    });

    return {
      userId: createdUserId,
      idToken: sessionContent.idToken,
    };
  }

  async getRedirectLogoutUrl({ userId, logoutUrlUUID }) {
    const redirectTarget = new URL(this.logoutUrl);
    const key = `${userId}:${logoutUrlUUID}`;
    const idToken = await logoutUrlTemporaryStorage.get(key);
    const params = [
      { key: 'id_token_hint', value: idToken },
      { key: 'redirect_uri', value: this.afterLogoutUrl },
    ];

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

  createAuthenticationComplement({ sessionContent }) {
    return new AuthenticationMethod.OidcAuthenticationComplement({
      accessToken: sessionContent.accessToken,
      refreshToken: sessionContent.refreshToken,
      expiredDate: moment().add(sessionContent.expiresIn, 's').toDate(),
    });
  }
}

module.exports = PoleEmploiOidcAuthenticationService;
