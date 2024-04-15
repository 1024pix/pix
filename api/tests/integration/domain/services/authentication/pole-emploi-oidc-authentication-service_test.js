import { randomUUID } from 'node:crypto';

import * as OidcIdentityProviders from '../../../../../lib/domain/constants/oidc-identity-providers.js';
import { UserToCreate } from '../../../../../lib/domain/models/UserToCreate.js';
import { PoleEmploiOidcAuthenticationService } from '../../../../../lib/domain/services/authentication/pole-emploi-oidc-authentication-service.js';
import { temporaryStorage } from '../../../../../lib/infrastructure/temporary-storage/index.js';
import { config } from '../../../../../src/shared/config.js';
import * as authenticationMethodRepository from '../../../../../src/shared/infrastructure/repositories/authentication-method-repository.js';
import * as userToCreateRepository from '../../../../../src/shared/infrastructure/repositories/user-to-create-repository.js';
import { expect, knex } from '../../../../test-helper.js';

const defaultSessionTemporaryStorage = temporaryStorage.withPrefix('oidc-session:');
const logoutUrlTemporaryStorage = temporaryStorage.withPrefix('logout-url:');

describe('Integration | Domain | Services | pole-emploi-oidc-authentication-service', function () {
  describe('#createUserAccount', function () {
    it('creates a user with an authentication method and returns a user id', async function () {
      // given
      const externalIdentityId = '1HHF940';
      const sessionContent = {
        accessToken: 'accessToken',
        idToken: 'idToken',
        expiresIn: 10,
        refreshToken: 'refreshToken',
      };
      const user = new UserToCreate({
        firstName: 'Adam',
        lastName: 'Troisjours',
      });
      const poleEmploiAuthenticationService = new PoleEmploiOidcAuthenticationService({
        ...config.oidcExampleNet,
        additionalRequiredProperties: 'afterLogoutUrl,logoutUrl',
        customProperties: { logoutUrl: 'https://logout-url.fr', afterLogoutUrl: 'https://after-logout.fr' },
        identityProvider: 'POLE_EMPLOI',
        openidClientExtraMetadata: { token_endpoint_auth_method: 'client_secret_post' },
        organizationName: 'France Travail',
        shouldCloseSession: true,
        slug: 'pole-emploi',
        source: 'pole_emploi_connect',
      });

      // when
      const createdUserId = await poleEmploiAuthenticationService.createUserAccount({
        externalIdentityId,
        user,
        sessionContent,
        authenticationMethodRepository,
        userToCreateRepository,
      });

      // then
      const createdUser = await knex('users').where({ id: createdUserId }).first();
      expect(createdUser.firstName).to.equal('Adam');
      expect(createdUser.lastName).to.equal('Troisjours');
      const authenticationMethods = await knex('authentication-methods').where({ userId: createdUserId });
      expect(authenticationMethods).to.have.lengthOf(1);
      expect(authenticationMethods[0].identityProvider).to.equal(OidcIdentityProviders.POLE_EMPLOI.code);
    });
  });

  describe('#getRedirectLogoutUrl', function () {
    describe('when the user ID Token is not stored in the parent default temporary storage', function () {
      it('removes the idToken from temporary storage and returns a redirect logout url', async function () {
        // given
        const idToken =
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
        const userId = 1;
        const logoutUrlUUID = randomUUID();
        const key = `${userId}:${logoutUrlUUID}`;
        const poleEmploiOidcAuthenticationService = new PoleEmploiOidcAuthenticationService({
          ...config.oidcExampleNet,
          additionalRequiredProperties: 'afterLogoutUrl,logoutUrl',
          customProperties: { logoutUrl: 'https://logout-url.fr', afterLogoutUrl: 'https://after-logout.fr' },
          identityProvider: 'POLE_EMPLOI',
          openidClientExtraMetadata: { token_endpoint_auth_method: 'client_secret_post' },
          organizationName: 'France Travail',
          shouldCloseSession: true,
          slug: 'pole-emploi',
          source: 'pole_emploi_connect',
        });
        await logoutUrlTemporaryStorage.save({ key, value: idToken, expirationDelaySeconds: 1140 });

        // when
        const redirectTarget = await poleEmploiOidcAuthenticationService.getRedirectLogoutUrl({
          userId,
          logoutUrlUUID,
        });

        // then
        const expectedResult = await logoutUrlTemporaryStorage.get(key);
        expect(expectedResult).to.be.undefined;

        expect(redirectTarget).to.equal(
          'https://logout-url.fr/?id_token_hint=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c&redirect_uri=https%3A%2F%2Fafter-logout.fr',
        );
      });
    });

    describe('when the user ID Token is stored in the parent default temporary storage', function () {
      it('removes the idToken from temporary storage and returns a redirect logout url', async function () {
        // given
        const idToken =
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
        const userId = 1;
        const logoutUrlUUID = randomUUID();
        const key = `${userId}:${logoutUrlUUID}`;
        const poleEmploiOidcAuthenticationService = new PoleEmploiOidcAuthenticationService({
          ...config.oidcExampleNet,
          additionalRequiredProperties: 'afterLogoutUrl,logoutUrl',
          customProperties: { logoutUrl: 'https://logout-url.fr', afterLogoutUrl: 'https://after-logout.fr' },
          identityProvider: 'POLE_EMPLOI',
          openidClientExtraMetadata: { token_endpoint_auth_method: 'client_secret_post' },
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
        expect(expectedResult).to.be.undefined;

        expect(redirectTarget).to.equal(
          'https://logout-url.fr/?id_token_hint=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c&redirect_uri=https%3A%2F%2Fafter-logout.fr',
        );
      });
    });
  });
});
