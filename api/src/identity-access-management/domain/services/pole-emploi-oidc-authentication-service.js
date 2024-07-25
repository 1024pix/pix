import dayjs from 'dayjs';

import { DomainTransaction } from '../../../shared/domain/DomainTransaction.js';
import { AuthenticationMethod } from '../../../shared/domain/models/index.js';
import { logger } from '../../../shared/infrastructure/utils/logger.js';
import { OidcAuthenticationService } from '../../domain/services/oidc-authentication-service.js';

export class PoleEmploiOidcAuthenticationService extends OidcAuthenticationService {
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
    const idToken = await this.sessionTemporaryStorage.get(key);

    const params = [
      { key: 'id_token_hint', value: idToken },
      { key: 'redirect_uri', value: this.afterLogoutUrl },
    ];

    params.forEach(({ key, value }) => redirectTarget.searchParams.append(key, value));

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
