import dayjs from 'dayjs';

import { OidcAuthenticationService } from '../../../../src/authentication/domain/services/oidc-authentication-service.js';
import { DomainTransaction } from '../../../infrastructure/DomainTransaction.js';
import { temporaryStorage } from '../../../infrastructure/temporary-storage/index.js';
import { AuthenticationMethod } from '../../models/index.js';

const logoutUrlTemporaryStorage = temporaryStorage.withPrefix('logout-url:');

export class PoleEmploiOidcAuthenticationService extends OidcAuthenticationService {
  constructor(oidcProvider, dependencies) {
    super(oidcProvider, dependencies);

    this.logoutUrl = oidcProvider.additionalRequiredProperties.logoutUrl;
    this.afterLogoutUrl = oidcProvider.additionalRequiredProperties.afterLogoutUrl;
    this.sendingUrl = oidcProvider.additionalRequiredProperties.sendingUrl;
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

    let idToken = await logoutUrlTemporaryStorage.get(key);
    if (!idToken) {
      idToken = this.sessionTemporaryStorage.get(key);
    }

    const params = [
      { key: 'id_token_hint', value: idToken },
      { key: 'redirect_uri', value: this.afterLogoutUrl },
    ];

    params.forEach(({ key, value }) => redirectTarget.searchParams.append(key, value));

    await logoutUrlTemporaryStorage.delete(key);
    await this.sessionTemporaryStorage.delete(key);

    return redirectTarget.toString();
  }

  createAuthenticationComplement({ sessionContent }) {
    return new AuthenticationMethod.PoleEmploiOidcAuthenticationComplement({
      accessToken: sessionContent.accessToken,
      refreshToken: sessionContent.refreshToken,
      expiredDate: dayjs().add(sessionContent.expiresIn, 's').toDate(),
    });
  }
}
