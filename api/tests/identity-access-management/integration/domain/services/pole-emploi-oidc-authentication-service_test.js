import { randomUUID } from 'node:crypto';

import { expect } from 'chai';

import { PoleEmploiOidcAuthenticationService } from '../../../../../src/identity-access-management/domain/services/pole-emploi-oidc-authentication-service.js';
import { temporaryStorage } from '../../../../../src/shared/infrastructure/key-value-storages/index.js';
import { OIDC_PROVIDER_TEST_CONFIG } from '../../../../tooling/mocks/openid-client.mock.js';

const defaultSessionTemporaryStorage = temporaryStorage.withPrefix('oidc-session:');

describe('Integration | Identity Access Management | Domain | Services | pole-emploi-oidc-authentication-service', function () {
  describe('#getRedirectLogoutUrl', function () {
    it('removes the idToken from temporary storage and returns a redirect logout url', async function () {
      // given
      const idToken =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
      const userId = 1;
      const logoutUrlUUID = randomUUID();
      const key = `${userId}:${logoutUrlUUID}`;
      const poleEmploiOidcAuthenticationService = new PoleEmploiOidcAuthenticationService({
        ...OIDC_PROVIDER_TEST_CONFIG,
        additionalRequiredProperties: {
          logoutUrl: 'https://logout-url.fr',
          afterLogoutUrl: 'https://after-logout.fr',
        },
        identityProvider: 'POLE_EMPLOI',
        organizationName: 'France Travail',
        shouldCloseSession: true,
        slug: 'pole-emploi',
        source: 'pole_emploi_connect',
      });
      await defaultSessionTemporaryStorage.save({ key, value: idToken, expirationDelaySeconds: 1140 });

      // when
      const redirectTarget = await poleEmploiOidcAuthenticationService.getRedirectLogoutUrl({
        userId,
        logoutUrlUUID,
      });

      // then
      const expectedResult = await defaultSessionTemporaryStorage.get(key);
      expect(expectedResult).to.be.null;

      expect(redirectTarget).to.equal(
        'https://logout-url.fr/?id_token_hint=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c&redirect_uri=https%3A%2F%2Fafter-logout.fr',
      );
    });
  });
});
