import { config } from '../../../config.js';
import * as OidcAuthenticationService from './oidc-authentication-service.js';
import { DomainTransaction } from '../../../infrastructure/DomainTransaction.js';
import { AuthenticationMethod } from '../../models/AuthenticationMethod.js';
import dayjs from 'dayjs';
import uuid from 'uuid';

const { v4 } = uuid;
import { temporaryStorage } from '../../../infrastructure/temporary-storage/index.js';
const logoutUrlTemporaryStorage = temporaryStorage.withPrefix('logout-url:');

class PoleEmploiOidcAuthenticationService extends OidcAuthenticationService {
  constructor() {
    const clientId = config.poleEmploi.clientId;
    // Attention, les scopes serviceDigitauxExposition api_peconnect-servicesdigitauxv1 ne sont pas présents dans la documentation de Pole Emploi mais ils sont nécessaires à l'envoi des résultats
    const authenticationUrlParameters = [
      { key: 'realm', value: '/individu' },
      {
        key: 'scope',
        value: `application_${clientId} api_peconnect-individuv1 openid profile serviceDigitauxExposition api_peconnect-servicesdigitauxv1`,
      },
    ];

    super({
      source: 'pole_emploi_connect',
      identityProvider: 'POLE_EMPLOI',
      slug: 'pole-emploi',
      organizationName: 'Pôle Emploi',
      hasLogoutUrl: true,
      jwtOptions: { expiresIn: config.poleEmploi.accessTokenLifespanMs / 1000 },
      clientSecret: config.poleEmploi.clientSecret,
      clientId: clientId,
      tokenUrl: config.poleEmploi.tokenUrl,
      authenticationUrl: config.poleEmploi.authenticationUrl,
      authenticationUrlParameters,
      userInfoUrl: config.poleEmploi.userInfoUrl,
    });

    this.logoutUrl = config.poleEmploi.logoutUrl;
    this.afterLogoutUrl = config.poleEmploi.afterLogoutUrl;
    this.temporaryStorage = config.poleEmploi.temporaryStorage;
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
        identityProvider: this.identityProvider,
        userId: createdUserId,
        externalIdentifier: externalIdentityId,
        authenticationComplement: this.createAuthenticationComplement({ sessionContent }),
      });
      await authenticationMethodRepository.create({ authenticationMethod, domainTransaction });
    });

    return createdUserId;
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
      expiredDate: dayjs().add(sessionContent.expiresIn, 's').toDate(),
    });
  }
}

export { PoleEmploiOidcAuthenticationService };
