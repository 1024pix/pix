import { randomUUID } from 'node:crypto';

import dayjs from 'dayjs';

import { OidcAuthenticationService } from '../../../../src/authentication/domain/services/oidc-authentication-service.js';
import { config } from '../../../config.js';
import { DomainTransaction } from '../../../infrastructure/DomainTransaction.js';
import { temporaryStorage } from '../../../infrastructure/temporary-storage/index.js';
import { POLE_EMPLOI } from '../../constants/oidc-identity-providers.js';
import { AuthenticationMethod } from '../../models/index.js';

const configKey = POLE_EMPLOI.configKey;
const logoutUrlTemporaryStorage = temporaryStorage.withPrefix('logout-url:');

class PoleEmploiOidcAuthenticationService extends OidcAuthenticationService {
  constructor() {
    super({
      accessTokenLifespanMs: config[configKey].accessTokenLifespanMs,
      additionalRequiredProperties: ['logoutUrl', 'afterLogoutUrl', 'sendingUrl'],
      clientId: config[configKey].clientId,
      clientSecret: config[configKey].clientSecret,
      configKey,
      shouldCloseSession: true,
      identityProvider: POLE_EMPLOI.code,
      openidClientExtraMetadata: { token_endpoint_auth_method: 'client_secret_post' },
      openidConfigurationUrl: config[configKey].openidConfigurationUrl,
      organizationName: 'France Travail',
      redirectUri: config[configKey].redirectUri,
      // Attention, les scopes serviceDigitauxExposition api_peconnect-servicesdigitauxv1 ne sont pas présents dans la documentation de Pole Emploi mais ils sont nécessaires à l'envoi des résultats
      scope: `application_${config[configKey].clientId} api_peconnect-individuv1 openid profile serviceDigitauxExposition api_peconnect-servicesdigitauxv1`,
      slug: 'pole-emploi',
      source: 'pole_emploi_connect',
    });

    this.afterLogoutUrl = config[configKey].afterLogoutUrl;
    this.logoutUrl = config[configKey].logoutUrl;
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
    const uuid = randomUUID();

    await logoutUrlTemporaryStorage.save({
      key: `${userId}:${uuid}`,
      value: idToken,
      expirationDelaySeconds: this.sessionDurationSeconds,
    });

    return uuid;
  }

  createAuthenticationComplement({ sessionContent }) {
    return new AuthenticationMethod.PoleEmploiOidcAuthenticationComplement({
      accessToken: sessionContent.accessToken,
      refreshToken: sessionContent.refreshToken,
      expiredDate: dayjs().add(sessionContent.expiresIn, 's').toDate(),
    });
  }
}

export { PoleEmploiOidcAuthenticationService };
