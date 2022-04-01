const pick = require('lodash/pick');

const { catchErr, domainBuilder, databaseBuilder, expect, knex } = require('../../../test-helper');

const authenticationMethodRepository = require('../../../../lib/infrastructure/repositories/authentication-method-repository');
const schoolingRegistrationRepository = require('../../../../lib/infrastructure/repositories/schooling-registration-repository');
const userRepository = require('../../../../lib/infrastructure/repositories/user-repository');
const userToCreateRepository = require('../../../../lib/infrastructure/repositories/user-to-create-repository');

const AuthenticationMethod = require('../../../../lib/domain/models/AuthenticationMethod');
const { SchoolingRegistrationNotFound } = require('../../../../lib/domain/errors');

const userService = require('../../../../lib/domain/services/user-service');

describe('Integration | Domain | Services | user-service', function () {
  const hashedPassword = 'Abcdef1234';

  let user;
  let authenticationMethod;

  describe('#createUserWithPassword', function () {
    const userPickedAttributes = ['firstName', 'lastName', 'email', 'username', 'cgu'];
    const authenticationMethodPickedAttributes = ['authenticationComplement', 'externalIdentifier', 'identityProvider'];

    beforeEach(function () {
      user = domainBuilder.buildUser({ username: null });
      authenticationMethod = domainBuilder.buildAuthenticationMethod.withPixAsIdentityProviderAndHashedPassword({
        hashedPassword,
        userId: user.id,
      });
    });

    afterEach(async function () {
      await knex('authentication-methods').delete();
      await knex('users').delete();
    });

    it('should return saved user and authenticationMethod', async function () {
      // given
      const expectedUser = pick(user, userPickedAttributes);
      const expectedAuthenticationMethod = pick(authenticationMethod, authenticationMethodPickedAttributes);

      // when
      const foundUser = await userService.createUserWithPassword({
        user,
        hashedPassword,
        userRepository,
        userToCreateRepository,
        authenticationMethodRepository,
      });

      // then
      expect(pick(foundUser, userPickedAttributes)).to.deep.equal(expectedUser);

      const foundAuthenticationMethod = await authenticationMethodRepository.findOneByUserIdAndIdentityProvider({
        userId: foundUser.id,
        identityProvider: AuthenticationMethod.identityProviders.PIX,
      });
      expect(pick(foundAuthenticationMethod, authenticationMethodPickedAttributes)).to.deep.equal(
        expectedAuthenticationMethod
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

    afterEach(async function () {
      await knex('authentication-methods').delete();
      await knex('users').delete();
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
        identityProvider: AuthenticationMethod.identityProviders.PIX,
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
        expectedAuthenticationMethod
      );
    });
  });

  describe('#createAndReconcileUserToSchoolingRegistration', function () {
    let organizationId;
    let samlId;
    let schoolingRegistrationId;

    beforeEach(async function () {
      user = domainBuilder.buildUser();
      organizationId = databaseBuilder.factory.buildOrganization().id;
      schoolingRegistrationId = databaseBuilder.factory.buildSchoolingRegistration({
        userId: null,
      }).id;

      await databaseBuilder.commit();
    });

    afterEach(async function () {
      await knex('organization-learners').delete();
      await knex('authentication-methods').delete();
      await knex('users').delete();
    });

    context('when all goes well', function () {
      it('should create user', async function () {
        // when
        const updatedUserId = await userService.createAndReconcileUserToSchoolingRegistration({
          hashedPassword,
          samlId,
          schoolingRegistrationId,
          user,
          authenticationMethodRepository,
          schoolingRegistrationRepository,
          userToCreateRepository,
        });

        // then
        const foundSchoolingRegistration = await schoolingRegistrationRepository.get(schoolingRegistrationId);
        expect(updatedUserId).to.equal(foundSchoolingRegistration.userId);
      });

      it('should update updatedAt column in schooling-registration row', async function () {
        // given
        await knex('organization-learners')
          .update({ updatedAt: new Date('2019-01-01') })
          .where({ id: schoolingRegistrationId });
        const { updatedAt: beforeUpdatedAt } = await knex
          .select('updatedAt')
          .from('organization-learners')
          .where({ id: schoolingRegistrationId })
          .first();

        // when
        await userService.createAndReconcileUserToSchoolingRegistration({
          hashedPassword,
          samlId,
          schoolingRegistrationId,
          user,
          authenticationMethodRepository,
          schoolingRegistrationRepository,
          userToCreateRepository,
        });

        // then
        const { updatedAt: afterUpdatedAt } = await knex
          .select('updatedAt')
          .from('organization-learners')
          .where({ id: schoolingRegistrationId })
          .first();
        expect(afterUpdatedAt).to.be.above(beforeUpdatedAt);
      });

      context('when an authentication method is provided', function () {
        it('should create the authentication method for the created user', async function () {
          // given
          samlId = 'samlId';

          // when
          const result = await userService.createAndReconcileUserToSchoolingRegistration({
            hashedPassword,
            samlId,
            schoolingRegistrationId,
            user,
            authenticationMethodRepository,
            schoolingRegistrationRepository,
            userToCreateRepository,
          });

          // then
          const foundAuthenticationMethod = await knex('authentication-methods').where({
            identityProvider: AuthenticationMethod.identityProviders.GAR,
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
        schoolingRegistrationId = databaseBuilder.factory.buildSchoolingRegistration({
          userId,
          organizationId,
        }).id;
        await databaseBuilder.commit();

        // when
        const error = await catchErr(userService.createAndReconcileUserToSchoolingRegistration)({
          hashedPassword,
          samlId,
          schoolingRegistrationId,
          user,
          authenticationMethodRepository,
          schoolingRegistrationRepository,
          userToCreateRepository,
        });

        // then
        expect(error).to.be.instanceOf(SchoolingRegistrationNotFound);
        const foundSchoolingRegistrations = await knex('organization-learners').where('id', schoolingRegistrationId);
        expect(foundSchoolingRegistrations[0].userId).to.equal(userId);
        const foundUser = await knex('users').where({ email: user.email });
        expect(foundUser).to.have.lengthOf(0);
      });
    });
  });
});
