import lodash from 'lodash';

import { domainBuilder } from '../../../../tooling/domain-builder/domain-builder.js';
const { pick } = lodash;

import { NON_OIDC_IDENTITY_PROVIDERS } from '../../../../../src/identity-access-management/domain/constants/identity-providers.js';
import * as userService from '../../../../../src/identity-access-management/domain/services/user-service.js';
import * as authenticationMethodRepository from '../../../../../src/identity-access-management/infrastructure/repositories/authentication-method.repository.js';
import * as userRepository from '../../../../../src/identity-access-management/infrastructure/repositories/user.repository.js';
import { userToCreateRepository } from '../../../../../src/identity-access-management/infrastructure/repositories/user-to-create.repository.js';
import { getLearnerInfo } from '../../../../../src/prescription/learner-management/infrastructure/repositories/organization-learner-repository.js';
import * as organizationLearnerRepository from '../../../../../src/prescription/organization-learner/infrastructure/repositories/organization-learner-repository.js';
import { OrganizationLearnerNotFound } from '../../../../../src/shared/domain/errors.js';
import { expect } from '../../../../test-helper.js';
import { databaseBuilder, knex } from '../../../../tooling/databases.js';
import { catchErr } from '../../../../tooling/test-utils/error.js';

describe('Identity Access Management | Integration | Domain | Services | user-service', function () {
  const hashedPassword = 'Abcdef1234';

  let user;
  let authenticationMethod;

  describe('#createUserWithPassword', function () {
    const userPickedAttributes = ['firstName', 'lastName', 'email', 'username', 'cgu', 'locale'];
    const authenticationMethodPickedAttributes = ['authenticationComplement', 'externalIdentifier', 'identityProvider'];

    beforeEach(function () {
      user = domainBuilder.buildUser({ username: null });
      authenticationMethod = domainBuilder.buildAuthenticationMethod.withPixAsIdentityProviderAndHashedPassword({
        hashedPassword,
        userId: user.id,
      });
    });

    it('should return saved user and authenticationMethod', async function () {
      // given
      const locale = 'fr-BE';
      const expectedAuthenticationMethod = pick(authenticationMethod, authenticationMethodPickedAttributes);

      // when
      const foundUser = await userService.createUserWithPassword({
        user,
        locale,
        hashedPassword,
        userRepository,
        userToCreateRepository,
        authenticationMethodRepository,
      });

      // then
      expect(pick(foundUser, userPickedAttributes)).to.deep.equal({
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
      expect(pick(foundAuthenticationMethod, authenticationMethodPickedAttributes)).to.deep.equal(
        expectedAuthenticationMethod,
      );
    });

    it('should throw Error if user already exists', async function () {
      // given
      databaseBuilder.factory.buildUser(user);
      await databaseBuilder.commit();

      // when
      const error = await catchErr(userService.createUserWithPassword)({
        user,
        hashedPassword,
        userRepository,
        authenticationMethodRepository,
      });

      // then
      expect(error).to.be.instanceOf(Error);
    });
  });

  describe('#updateUsernameAndAddPassword', function () {
    const username = 'username.pix';

    const authenticationMethodPickedAttributes = ['userId', 'identityProvider', 'authenticationComplement'];
    const userPickedAttributes = ['id', 'firstName', 'lastName', 'email', 'username', 'cgu'];

    let user;

    beforeEach(async function () {
      user = databaseBuilder.factory.buildUser();
      await databaseBuilder.commit();
    });

    it('should update user username and user authenticationMethod password', async function () {
      // given
      const userId = user.id;

      const expectedUser = {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        username,
        cgu: user.cgu,
      };
      const expectedAuthenticationMethod = {
        userId,
        authenticationComplement: {
          password: hashedPassword,
          shouldChangePassword: true,
        },
        identityProvider: NON_OIDC_IDENTITY_PROVIDERS.PIX.code,
      };

      // when
      await userService.updateUsernameAndAddPassword({
        userId,
        username,
        hashedPassword,
        authenticationMethodRepository,
        userRepository,
      });

      // then
      const foundUser = await userRepository.getByUsernameOrEmailWithRolesAndPassword(username);
      expect(pick(foundUser, userPickedAttributes)).to.deep.equal(expectedUser);
      expect(pick(foundUser.authenticationMethods[0], authenticationMethodPickedAttributes)).to.deep.equal(
        expectedAuthenticationMethod,
      );
    });
  });

  describe('#createAndReconcileUserToOrganizationLearner', function () {
    let organizationId;
    let samlId;
    let organizationLearnerId;

    beforeEach(async function () {
      user = domainBuilder.buildUser();
      organizationId = databaseBuilder.factory.buildOrganization().id;
      organizationLearnerId = databaseBuilder.factory.buildOrganizationLearner({
        userId: null,
      }).id;

      await databaseBuilder.commit();
    });

    context('when all goes well', function () {
      it('should create user', async function () {
        // when
        const updatedUserId = await userService.createAndReconcileUserToOrganizationLearner({
          hashedPassword,
          samlId,
          organizationLearnerId,
          user,
          authenticationMethodRepository,
          organizationLearnerRepository,
          userToCreateRepository,
        });

        // then
        const foundOrganizationLearner = await getLearnerInfo(organizationLearnerId);
        expect(updatedUserId).to.equal(foundOrganizationLearner.userId);
      });

      it('should update updatedAt column in organization-learner row', async function () {
        // given
        await knex('organization-learners')
          .update({ updatedAt: new Date('2019-01-01') })
          .where({ id: organizationLearnerId });
        const { updatedAt: beforeUpdatedAt } = await knex
          .select('updatedAt')
          .from('organization-learners')
          .where({ id: organizationLearnerId })
          .first();

        // when
        await userService.createAndReconcileUserToOrganizationLearner({
          hashedPassword,
          samlId,
          organizationLearnerId,
          user,
          authenticationMethodRepository,
          organizationLearnerRepository,
          userToCreateRepository,
        });

        // then
        const { updatedAt: afterUpdatedAt } = await knex
          .select('updatedAt')
          .from('organization-learners')
          .where({ id: organizationLearnerId })
          .first();
        expect(afterUpdatedAt).to.be.above(beforeUpdatedAt);
      });

      context('when an authentication method is provided', function () {
        it('should create the authentication method for the created user', async function () {
          // given
          samlId = 'samlId';

          // when
          const result = await userService.createAndReconcileUserToOrganizationLearner({
            hashedPassword,
            samlId,
            organizationLearnerId,
            user,
            authenticationMethodRepository,
            organizationLearnerRepository,
            userToCreateRepository,
          });

          // then
          const foundAuthenticationMethod = await knex('authentication-methods').where({
            identityProvider: NON_OIDC_IDENTITY_PROVIDERS.GAR.code,
            externalIdentifier: samlId,
          });
          expect(foundAuthenticationMethod).to.have.lengthOf(1);
          expect(result).to.equal(foundAuthenticationMethod[0].userId);
        });
      });
    });

    context('when creation succeeds and association fails', function () {
      it('should rollback after association fails', async function () {
        // given
        const userId = databaseBuilder.factory.buildUser().id;
        organizationLearnerId = databaseBuilder.factory.buildOrganizationLearner({
          userId,
          organizationId,
        }).id;
        await databaseBuilder.commit();

        // when
        const error = await catchErr(userService.createAndReconcileUserToOrganizationLearner)({
          hashedPassword,
          samlId,
          organizationLearnerId,
          user,
          authenticationMethodRepository,
          organizationLearnerRepository,
          userToCreateRepository,
        });

        // then
        expect(error).to.be.instanceOf(OrganizationLearnerNotFound);
        const foundOrganizationLearners = await knex('organization-learners').where('id', organizationLearnerId);
        expect(foundOrganizationLearners[0].userId).to.equal(userId);
        const foundUser = await knex('users').where({ email: user.email });
        expect(foundUser).to.have.lengthOf(0);
      });
    });
  });
});
