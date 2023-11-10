import { expect, knex } from '../../../../test-helper.js';
import { temporaryStorage } from '../../../../../lib/infrastructure/temporary-storage/index.js';
import * as authenticationMethodRepository from '../../../../../lib/infrastructure/repositories/authentication-method-repository.js';
import * as userToCreateRepository from '../../../../../lib/infrastructure/repositories/user-to-create-repository.js';
import { PoleEmploiOidcAuthenticationService } from '../../../../../lib/domain/services/authentication/pole-emploi-oidc-authentication-service.js';
import { UserToCreate } from '../../../../../lib/domain/models/UserToCreate.js';
import * as OidcIdentityProviders from '../../../../../lib/domain/constants/oidc-identity-providers.js';

const logoutUrlTemporaryStorage = temporaryStorage.withPrefix('logout-url:');

describe('Integration | Domain | Services | pole-emploi-oidc-authentication-service', function () {
  describe('instanciate', function () {
    it('has speficic properties related to this identity provider', async function () {
      // when
      const fwbOidcAuthenticationService = new PoleEmploiOidcAuthenticationService();

      // then
      expect(fwbOidcAuthenticationService.source).to.equal('pole_emploi_connect');
      expect(fwbOidcAuthenticationService.identityProvider).to.equal('POLE_EMPLOI');
      expect(fwbOidcAuthenticationService.slug).to.equal('pole-emploi');
      expect(fwbOidcAuthenticationService.organizationName).to.equal('Pôle Emploi');
      expect(fwbOidcAuthenticationService.hasLogoutUrl).to.be.true;
    });
  });

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
      const poleEmploiAuthenticationService = new PoleEmploiOidcAuthenticationService();

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

  describe('#saveIdToken', function () {
    it('saves an idToken and returns an uuid', async function () {
      // given
      const uuidPattern = new RegExp(/^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i);
      const userId = 123;
      const poleEmploiOidcAuthenticationService = new PoleEmploiOidcAuthenticationService();

      // when
      const uuid = await poleEmploiOidcAuthenticationService.saveIdToken({ idToken: 'id_token', userId });

      // then
      expect(uuid.match(uuidPattern)).to.be.ok;
      const idToken = logoutUrlTemporaryStorage.get(`${userId}:${uuid}`);
      expect(idToken).to.deep.equal('id_token');
    });
  });
});
