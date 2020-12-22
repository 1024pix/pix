const pick = require('lodash/pick');

const {
  catchErr,
  domainBuilder,
  databaseBuilder,
  expect,
  knex,
} = require('../../../test-helper');

const authenticationMethodRepository = require('../../../../lib/infrastructure/repositories/authentication-method-repository');
const schoolingRegistrationRepository = require('../../../../lib/infrastructure/repositories/schooling-registration-repository');
const userRepository = require('../../../../lib/infrastructure/repositories/user-repository');

const AuthenticationMethod = require('../../../../lib/domain/models/AuthenticationMethod');
const { SchoolingRegistrationNotFound } = require('../../../../lib/domain/errors');

const userService = require('../../../../lib/domain/services/user-service');

describe('Integration | Domain | Services | user-service', () => {

  const hashedPassword = 'Abcdef1234';

  let user;
  let authenticationMethod;

  describe('#createUserWithPassword', () => {

    const userPickedAttributes = ['firstName', 'lastName', 'email', 'username', 'cgu'];
    const authenticationMethodPickedAttributes = ['authenticationComplement', 'externalIdentifier', 'identityProvider'];

    beforeEach(() => {
      user = domainBuilder.buildUser({ username: null });
      authenticationMethod = domainBuilder.buildAuthenticationMethod.buildWithHashedPassword({
        hashedPassword,
        userId: user.id,
      });
    });

    afterEach(async () => {
      await knex('authentication-methods').delete();
      await knex('users').delete();
    });

    it('should return saved user and authenticationMethod', async () => {
      // given
      const expectedUser = pick(user, userPickedAttributes);
      const expectedAuthenticationMethod = pick(authenticationMethod, authenticationMethodPickedAttributes);

      // when
      const foundUser = await userService.createUserWithPassword({
        user,
        hashedPassword,
        userRepository,
        authenticationMethodRepository,
      });

      // then
      expect(pick(foundUser, userPickedAttributes)).to.deep.equal(expectedUser);

      const foundAuthenticationMethod = await authenticationMethodRepository.findOneByUserIdAndIdentityProvider({
        userId: foundUser.id,
        identityProvider: AuthenticationMethod.identityProviders.PIX,
      });
      expect(pick(foundAuthenticationMethod, authenticationMethodPickedAttributes))
        .to.deep.equal(expectedAuthenticationMethod);
    });

    it('should throw Error if user already exists', async () => {
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

  describe('#updateUsernameAndAddPassword', () => {

    const username = 'username.pix';

    const authenticationMethodPickedAttributes = ['userId', 'identityProvider', 'authenticationComplement'];
    const userPickedAttributes = ['id', 'firstName', 'lastName', 'email', 'username', 'cgu'];

    let user;

    beforeEach(async () => {
      user = databaseBuilder.factory.buildUser();
      await databaseBuilder.commit();
    });

    afterEach(async () => {
      await knex('authentication-methods').delete();
      await knex('users').delete();
    });

    it('should update user username and user authenticationMethod password', async () => {
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
      expect(pick(foundUser.authenticationMethods[0], authenticationMethodPickedAttributes))
        .to.deep.equal(expectedAuthenticationMethod);
    });
  });

  describe('#createAndReconcileUserToSchoolingRegistration', () => {

    let organizationId;
    let samlId;
    let schoolingRegistrationId;

    beforeEach(async () => {
      user = domainBuilder.buildUser();
      organizationId = databaseBuilder.factory.buildOrganization().id;
      schoolingRegistrationId = databaseBuilder.factory.buildSchoolingRegistration({
        userId: null,
      }).id;

      await databaseBuilder.commit();
    });

    afterEach(async () => {
      await knex('schooling-registrations').delete();
      await knex('authentication-methods').delete();
      await knex('users').delete();
    });

    context('when all goes well', function() {

      it('should create user', async () => {
        // when
        const updatedUserId = await userService.createAndReconcileUserToSchoolingRegistration({
          hashedPassword,
          samlId,
          schoolingRegistrationId,
          user,
          authenticationMethodRepository,
          schoolingRegistrationRepository,
          userRepository,
        });

        // then
        const foundSchoolingRegistration = await schoolingRegistrationRepository.get(schoolingRegistrationId);
        expect(updatedUserId).to.equal(foundSchoolingRegistration.userId);
      });

      it('should update updatedAt column in schooling-registration row', async () => {
        // given
        await knex('schooling-registrations')
          .update({ updatedAt: new Date('2019-01-01') })
          .where({ id: schoolingRegistrationId });
        const { updatedAt: beforeUpdatedAt } = await knex.select('updatedAt')
          .from('schooling-registrations')
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
          userRepository,
        });

        // then
        const { updatedAt: afterUpdatedAt } = await knex.select('updatedAt')
          .from('schooling-registrations')
          .where({ id: schoolingRegistrationId })
          .first();
        expect(afterUpdatedAt).to.be.above(beforeUpdatedAt);
      });

      context('when an authentication method is provided', () => {

        it('should create the authentication method for the created user', async () => {
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
            userRepository,
          });

          // then
          const foundAuthenticationMethod = await knex('authentication-methods')
            .where({
              identityProvider: AuthenticationMethod.identityProviders.GAR,
              externalIdentifier: samlId,
            });
          expect(foundAuthenticationMethod).to.have.lengthOf(1);
          expect(result).to.equal(foundAuthenticationMethod[0].userId);
        });
      });
    });

    context('when creation succeeds and association fails', () => {

      it('should rollback after association fails', async () => {
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
          userRepository,
        });

        // then
        expect(error).to.be.instanceOf(SchoolingRegistrationNotFound);
        const foundSchoolingRegistrations = await knex('schooling-registrations').where('id', schoolingRegistrationId);
        expect(foundSchoolingRegistrations[0].userId).to.equal(userId);
        const foundUser = await knex('users').where({ email: user.email });
        expect(foundUser).to.have.lengthOf(0);
      });
    });
  });

});
