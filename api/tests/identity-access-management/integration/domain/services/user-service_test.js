import lodash from 'lodash';

import { domainBuilder } from '../../../../tooling/domain-builder/domain-builder.js';
const { pick } = lodash;

import { NON_OIDC_IDENTITY_PROVIDERS } from '../../../../../src/identity-access-management/domain/constants/identity-providers.js';
import * as userService from '../../../../../src/identity-access-management/domain/services/user-service.js';
import * as authenticationMethodRepository from '../../../../../src/identity-access-management/infrastructure/repositories/authentication-method.repository.js';
import * as userRepository from '../../../../../src/identity-access-management/infrastructure/repositories/user.repository.js';
import { userToCreateRepository } from '../../../../../src/identity-access-management/infrastructure/repositories/user-to-create.repository.js';
import { expect } from '../../../../test-helper.js';
import { databaseBuilder, knex } from '../../../../tooling/databases.js';
import { catchErr } from '../../../../tooling/test-utils/error.js';

describe('Identity Access Management | Integration | Domain | Services | user-service', function () {
  let user;
  let authenticationMethod;

  describe('#createUserWithPassword', function () {
    const userAttributes = ['firstName', 'lastName', 'email', 'username', 'cgu', 'locale'];
    const authenticationMethodAttributes = ['authenticationComplement', 'externalIdentifier', 'identityProvider'];

    beforeEach(function () {
      user = domainBuilder.buildUser({ username: null });
      authenticationMethod = domainBuilder.buildAuthenticationMethod.withPixAsIdentityProviderAndHashedPassword({
        hashedPassword: 'Abcdef1234',
        userId: user.id,
      });
    });

    it('returns saved user and authenticationMethod', async function () {
      // given
      const expectedAuthenticationMethod = pick(authenticationMethod, authenticationMethodAttributes);

      // when
      const foundUser = await userService.createUserWithPassword({
        user,
        locale: 'fr-BE',
        hashedPassword: 'Abcdef1234',
        userRepository,
        userToCreateRepository,
        authenticationMethodRepository,
      });

      // then
      const foundUserAttrs = pick(foundUser, userAttributes);
      expect(foundUserAttrs).to.deep.equal({
        cgu: true,
        email: 'jeseraila@example.net',
        firstName: 'Lorie',
        lastName: 'MeilleureAmie',
        locale: 'fr-BE',
        username: null,
      });

      const foundAuthenticationMethod = await authenticationMethodRepository.findOneByUserIdAndIdentityProvider({
        userId: foundUser.id,
        identityProvider: NON_OIDC_IDENTITY_PROVIDERS.PIX.code,
      });
      const foundAuthenticationMethodAttrs = pick(foundAuthenticationMethod, authenticationMethodAttributes);
      expect(foundAuthenticationMethodAttrs).to.deep.equal(expectedAuthenticationMethod);
    });

    it('throws Error if user already exists', async function () {
      // given
      databaseBuilder.factory.buildUser(user);
      await databaseBuilder.commit();

      // when
      const error = await catchErr(userService.createUserWithPassword)({
        user,
        hashedPassword: 'Abcdef1234',
        userRepository,
        authenticationMethodRepository,
      });

      // then
      expect(error).to.be.instanceOf(Error);
    });
  });

  describe('#updateUsernameAndAddPassword', function () {
    const username = 'username.pix';

    const authenticationMethodAttributes = ['userId', 'identityProvider', 'authenticationComplement'];
    const userAttributes = ['id', 'firstName', 'lastName', 'email', 'username', 'cgu'];

    let user;

    beforeEach(async function () {
      user = databaseBuilder.factory.buildUser();
      await databaseBuilder.commit();
    });

    it('updates user username and user authenticationMethod password', async function () {
      // when
      await userService.updateUsernameAndAddPassword({
        userId: user.id,
        username,
        hashedPassword: 'Abcdef1234',
        authenticationMethodRepository,
        userRepository,
      });

      // then
      const foundUser = await userRepository.getByUsernameOrEmailWithRolesAndPassword(username);
      const foundUserAttrs = pick(foundUser, userAttributes);
      expect(foundUserAttrs).to.deep.equal({
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        username,
        cgu: user.cgu,
      });
      const foundAuthenticationMethodAttrs = pick(foundUser.authenticationMethods[0], authenticationMethodAttributes);
      expect(foundAuthenticationMethodAttrs).to.deep.equal({
        userId: user.id,
        identityProvider: NON_OIDC_IDENTITY_PROVIDERS.PIX.code,
        authenticationComplement: {
          password: 'Abcdef1234',
          shouldChangePassword: true,
        },
      });
    });
  });

  describe('createUserWithGarOrPassword', function () {
    let samlId;

    beforeEach(async function () {
      user = domainBuilder.buildUser();
      await databaseBuilder.commit();
    });

    context('when HashedPassword is provided', function () {
      it('creates a PIX authentication method for the created user', async function () {
        // when
        const userId = await userService.createUserWithGarOrPassword({
          hashedPassword: 'Abcdef1234',
          samlId,
          user,
          authenticationMethodRepository,
          userToCreateRepository,
        });

        // then
        const foundUser = await knex('users').where({ id: userId }).first();
        expect(foundUser.firstName).to.equal(user.firstName);
        expect(foundUser.lastName).to.equal(user.lastName);

        const foundAuthenticationMethod = await knex('authentication-methods').where({
          identityProvider: NON_OIDC_IDENTITY_PROVIDERS.PIX.code,
          userId,
        });
        expect(foundAuthenticationMethod).to.have.lengthOf(1);
      });
    });

    context('when SAML ID is provided', function () {
      it('creates a GAR authentication method for the created user', async function () {
        // when
        const userId = await userService.createUserWithGarOrPassword({
          samlId: 'samlId',
          user,
          authenticationMethodRepository,
          userToCreateRepository,
        });

        // then
        const foundUser = await knex('users').where({ id: userId }).first();
        expect(foundUser.firstName).to.equal(user.firstName);
        expect(foundUser.lastName).to.equal(user.lastName);

        const foundAuthenticationMethod = await knex('authentication-methods').where({
          identityProvider: NON_OIDC_IDENTITY_PROVIDERS.GAR.code,
          userId,
        });
        expect(foundAuthenticationMethod).to.have.lengthOf(1);
        expect(foundAuthenticationMethod[0].externalIdentifier).to.equal('samlId');
      });
    });
  });
});
