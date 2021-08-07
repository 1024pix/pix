const _ = require('lodash');
const {
  catchErr,
  databaseBuilder,
  domainBuilder,
  expect,
  knex,
} = require('../../../test-helper');
const {
  AlreadyExistingEntityError,
  AuthenticationMethodNotFoundError,
} = require('../../../../lib/domain/errors');
const AuthenticationMethod = require('../../../../lib/domain/models/AuthenticationMethod');
const authenticationMethodRepository = require('../../../../lib/infrastructure/repositories/authentication-method-repository');
const DomainTransaction = require('../../../../lib/infrastructure/DomainTransaction');

describe('Integration | Repository | AuthenticationMethod', function() {

  const hashedPassword = 'ABCDEF1234';
  const newHashedPassword = '1234ABCDEF';

  describe('#create', function() {

    afterEach(function() {
      return knex('authentication-methods').delete();
    });

    context('when creating a AuthenticationMethod containing an external identifier', function() {

      it('should return an AuthenticationMethod', async function() {
        // given
        const userId = databaseBuilder.factory.buildUser().id;
        await databaseBuilder.commit();

        const authenticationMethod = domainBuilder.buildAuthenticationMethod({
          identityProvider: AuthenticationMethod.identityProviders.GAR,
          externalIdentifier: 'externalIdentifier',
          userId,
        });
        delete authenticationMethod.id;

        // when
        const savedAuthenticationMethod = await authenticationMethodRepository.create({ authenticationMethod });

        // then
        expect(savedAuthenticationMethod).to.be.instanceOf(AuthenticationMethod);
        authenticationMethod.authenticationComplement = undefined;
        const ignoredColumns = ['id', 'createdAt', 'updatedAt'];
        expect(_.omit(savedAuthenticationMethod, ignoredColumns)).to.deep.equal(_.omit(authenticationMethod, ignoredColumns));
      });

      it('should save an AuthenticationMethod in database', async () => {
        // given
        const userId = databaseBuilder.factory.buildUser().id;
        await databaseBuilder.commit();

        const authenticationMethod = domainBuilder.buildAuthenticationMethod({
          identityProvider: AuthenticationMethod.identityProviders.GAR,
          externalIdentifier: 'externalIdentifier',
          userId,
        });
        delete authenticationMethod.id;

        // when
        const savedAuthenticationMethod = await authenticationMethodRepository.create({ authenticationMethod });

        // then
        const [ authenticationMethodId ] = await knex('authentication-methods').pluck('id').where({ externalIdentifier: 'externalIdentifier' });
        expect(authenticationMethodId).to.equal(savedAuthenticationMethod.id);
      });
    });

    context('when an AuthenticationMethod already exists for an identity provider and an external identifier', function() {

      it('should throw an AlreadyExistingEntityError', async function() {
        // given
        const userIdA = databaseBuilder.factory.buildUser().id;
        const userIdB = databaseBuilder.factory.buildUser().id;
        const authenticationMethodA = domainBuilder.buildAuthenticationMethod({
          identityProvider: AuthenticationMethod.identityProviders.GAR,
          externalIdentifier: 'alreadyExistingExternalIdentifier',
          userId: userIdA,
        });
        delete authenticationMethodA.id;
        databaseBuilder.factory.buildAuthenticationMethod(authenticationMethodA);
        await databaseBuilder.commit();
        const authenticationMethodB = domainBuilder.buildAuthenticationMethod({
          identityProvider: AuthenticationMethod.identityProviders.GAR,
          externalIdentifier: 'alreadyExistingExternalIdentifier',
          userId: userIdB,
        });
        delete authenticationMethodB.id;

        // when
        const error = await catchErr(authenticationMethodRepository.create)({ authenticationMethod: authenticationMethodB });

        // then
        expect(error).to.be.instanceOf(AlreadyExistingEntityError);
      });
    });

    context('when an AuthenticationMethod already exists for an identity provider and a userId', function() {

      it('should throw an AlreadyExistingEntityError', async function() {
        // given
        const userId = databaseBuilder.factory.buildUser().id;
        const authenticationMethodA = domainBuilder.buildAuthenticationMethod({
          identityProvider: AuthenticationMethod.identityProviders.GAR,
          externalIdentifier: 'someIdentifierA',
          userId,
        });
        delete authenticationMethodA.id;
        databaseBuilder.factory.buildAuthenticationMethod(authenticationMethodA);
        await databaseBuilder.commit();
        const authenticationMethodB = domainBuilder.buildAuthenticationMethod({
          identityProvider: AuthenticationMethod.identityProviders.GAR,
          externalIdentifier: 'someIdentifierB',
          userId,
        });
        delete authenticationMethodB.id;

        // when
        const error = await catchErr(authenticationMethodRepository.create)({ authenticationMethod: authenticationMethodB });

        // then
        expect(error).to.be.instanceOf(AlreadyExistingEntityError);
      });
    });

    it('should be DomainTransaction compliant', async function() {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      await databaseBuilder.commit();
      const authenticationMethod = domainBuilder.buildAuthenticationMethod({
        identityProvider: AuthenticationMethod.identityProviders.GAR,
        externalIdentifier: 'externalIdentifier',
        userId,
      });
      delete authenticationMethod.id;

      // when
      await catchErr(async () => {
        await DomainTransaction.execute(async (domainTransaction) => {
          await authenticationMethodRepository.create({ authenticationMethod, domainTransaction });
          throw new Error('Error occurs in transaction');
        });
      })();

      // then
      const results = await knex('authentication-methods').where({ externalIdentifier: 'externalIdentifier' });
      expect(results).to.be.empty;
    });
  });

  describe('#updateChangedPassword', function() {

    let userId;

    beforeEach(async function() {
      userId = databaseBuilder.factory.buildUser().id;
      await databaseBuilder.commit();
    });

    it('should update the password in database', async function() {
      // given
      const authenticationMethodId = databaseBuilder.factory.buildAuthenticationMethod.buildWithHashedPassword({
        userId,
        hashedPassword,
      }).id;
      await databaseBuilder.commit();

      // when
      await authenticationMethodRepository.updateChangedPassword({
        userId,
        hashedPassword: newHashedPassword,
      });

      // then
      const [ authenticationComplement ] = await knex('authentication-methods').pluck('authenticationComplement').where({ id: authenticationMethodId });
      expect(authenticationComplement.password).to.equal(newHashedPassword);
    });

    it('should return the updated AuthenticationMethod', async () => {
      // given
      const originalAuthenticationMethod = domainBuilder.buildAuthenticationMethod.buildWithHashedPassword({
        id: 123,
        userId,
        hashedPassword,
      });
      databaseBuilder.factory.buildAuthenticationMethod.buildWithHashedPassword(originalAuthenticationMethod);
      await databaseBuilder.commit();

      // when
      const updatedAuthenticationMethod = await authenticationMethodRepository.updateChangedPassword({
        userId,
        hashedPassword: newHashedPassword,
      });

      // then
      const expectedAuthenticationMethod = domainBuilder.buildAuthenticationMethod.buildWithHashedPassword({
        id: 123,
        userId,
        hashedPassword: newHashedPassword,
      });
      expect(updatedAuthenticationMethod).to.be.an.instanceOf(AuthenticationMethod);
      expect(_.omit(updatedAuthenticationMethod, ['updatedAt'])).to.deep.equal(_.omit(expectedAuthenticationMethod, ['updatedAt']));
    });

    it('should disable changing password', async function() {
      // given
      databaseBuilder.factory.buildAuthenticationMethod.buildWithHashedPassword({
        userId,
        hashedPassword,
        shouldChangePassword: true,
      });
      await databaseBuilder.commit();

      // when
      const updatedAuthenticationMethod = await authenticationMethodRepository.updateChangedPassword({
        userId,
        hashedPassword: newHashedPassword,
      });

      // then
      expect(updatedAuthenticationMethod.authenticationComplement.shouldChangePassword).to.be.false;
    });

    it('should throw AuthenticationMethodNotFoundError when user id not found', async function() {
      // given
      const wrongUserId = 0;

      // when
      const error = await catchErr(authenticationMethodRepository.updateChangedPassword)({
        userId: wrongUserId,
        hashedPassword,
      });

      // then
      expect(error).to.be.instanceOf(AuthenticationMethodNotFoundError);
    });

    it('should be DomainTransaction compliant', async function() {
      // given
      const authenticationMethod = databaseBuilder.factory.buildAuthenticationMethod.buildWithHashedPassword({
        userId,
        hashedPassword,
      });
      await databaseBuilder.commit();

      // when
      await catchErr(async () => {
        await DomainTransaction.execute(async (domainTransaction) => {
          await authenticationMethodRepository.updateChangedPassword({ userId, hashedPassword: 'coucou' }, domainTransaction);
          throw new Error('Error occurs in transaction');
        });
      })();

      // then
      const [ authenticationComplement ] = await knex('authentication-methods').pluck('authenticationComplement').where({ id: authenticationMethod.id });
      expect(authenticationComplement.password).to.be.equal(hashedPassword);
    });
  });

  describe('#findOneByUserIdAndIdentityProvider', function() {

    it('should return the AuthenticationMethod associated to a user for a given identity provider', async function() {
      // given
      const identityProvider = AuthenticationMethod.identityProviders.GAR;
      const userId = databaseBuilder.factory.buildUser().id;
      databaseBuilder.factory.buildAuthenticationMethod.buildWithHashedPassword({
        userId,
      });
      const garAuthenticationMethod = domainBuilder.buildAuthenticationMethod({ id: 123, identityProvider, userId });
      garAuthenticationMethod.authenticationComplement = undefined;
      databaseBuilder.factory.buildAuthenticationMethod(garAuthenticationMethod);
      await databaseBuilder.commit();

      // when
      const authenticationMethodsByUserIdAndIdentityProvider = await authenticationMethodRepository.findOneByUserIdAndIdentityProvider({ userId, identityProvider });

      // then
      expect(authenticationMethodsByUserIdAndIdentityProvider).to.be.instanceof(AuthenticationMethod);
      expect(authenticationMethodsByUserIdAndIdentityProvider).to.deep.equal(garAuthenticationMethod);
    });

    it('should return null if there is no AuthenticationMethod for the given user and identity provider', async function() {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      databaseBuilder.factory.buildAuthenticationMethod({
        identityProvider: AuthenticationMethod.identityProviders.POLE_EMPLOI,
        userId,
      });
      await databaseBuilder.commit();

      // when
      const authenticationMethodsByUserIdAndIdentityProvider = await authenticationMethodRepository.findOneByUserIdAndIdentityProvider({
        userId,
        identityProvider: AuthenticationMethod.identityProviders.GAR,
      });

      // then
      expect(authenticationMethodsByUserIdAndIdentityProvider).to.be.null;
    });
  });

  describe('#findOneByExternalIdentifierAndIdentityProvider', function() {

    it('should return the AuthenticationMethod for a given external identifier and identity provider', async function() {
      // given
      const identityProvider = AuthenticationMethod.identityProviders.GAR;
      const externalIdentifier = 'samlId';
      const authenticationMethodInDB = databaseBuilder.factory.buildAuthenticationMethod({ externalIdentifier, identityProvider });
      databaseBuilder.factory.buildAuthenticationMethod({ externalIdentifier: 'another_sub', identityProvider });
      await databaseBuilder.commit();

      // when
      const authenticationMethodsByTypeAndValue = await authenticationMethodRepository.findOneByExternalIdentifierAndIdentityProvider({ externalIdentifier, identityProvider });

      // then
      expect(authenticationMethodsByTypeAndValue).to.be.instanceof(AuthenticationMethod);
      expect(authenticationMethodsByTypeAndValue).to.deep.equal(authenticationMethodInDB);
    });

    it('should return null if there is no AuthenticationMethods for the given external identifier and identity provider', async function() {
      // given
      const identityProvider = AuthenticationMethod.identityProviders.GAR;
      const externalIdentifier = 'samlId';

      // when
      const authenticationMethodsByTypeAndValue = await authenticationMethodRepository.findOneByExternalIdentifierAndIdentityProvider({ externalIdentifier, identityProvider });

      // then
      expect(authenticationMethodsByTypeAndValue).to.be.null;
    });
  });

  describe('#updateExternalIdentifierByUserIdAndIdentityProvider', function() {

    context('When authentication method exists', function() {

      let authenticationMethod;

      beforeEach(function() {
        const userId = databaseBuilder.factory.buildUser().id;
        authenticationMethod = databaseBuilder.factory.buildAuthenticationMethod({
          identityProvider: AuthenticationMethod.identityProviders.GAR,
          externalIdentifier: 'to_be_updated',
          userId,
        });
        return databaseBuilder.commit();
      });

      it('should update external identifier by userId and identity provider', async function() {
        // given
        const userId = authenticationMethod.userId;
        const identityProvider = authenticationMethod.identityProvider;
        const externalIdentifier = 'new_saml_id';

        // when
        const updatedAuthenticationMethod = await authenticationMethodRepository.updateExternalIdentifierByUserIdAndIdentityProvider({ externalIdentifier, userId, identityProvider });

        // then
        expect(updatedAuthenticationMethod.externalIdentifier).to.equal(externalIdentifier);
      });
    });

    context('When authentication method does not exist', function() {

      it('should throw an AuthenticationMethodNotFoundError', async function() {
        // given
        const userId = 12345;
        const identityProvider = AuthenticationMethod.identityProviders.GAR;
        const externalIdentifier = 'new_saml_id';

        // when
        const error = await catchErr(authenticationMethodRepository.updateExternalIdentifierByUserIdAndIdentityProvider)({ externalIdentifier, userId, identityProvider });

        // then
        expect(error).to.be.instanceOf(AuthenticationMethodNotFoundError);
      });
    });
  });

  describe('#updatePasswordThatShouldBeChanged', function() {

    let userId;

    beforeEach(async function() {
      userId = databaseBuilder.factory.buildUser().id;
      databaseBuilder.factory.buildAuthenticationMethod.buildWithHashedPassword({
        userId,
        hashedPassword,
        shouldChangePassword: false,
      });
      await databaseBuilder.commit();
    });

    it('should update password and set shouldChangePassword to true', async function() {
      // given
      const expectedAuthenticationComplement = new AuthenticationMethod.PixAuthenticationComplement({
        password: newHashedPassword,
        shouldChangePassword: true,
      });

      // when
      const updatedAuthenticationMethod = await authenticationMethodRepository.updatePasswordThatShouldBeChanged({
        userId,
        hashedPassword: newHashedPassword,
      });

      // then
      expect(updatedAuthenticationMethod).to.be.an.instanceOf(AuthenticationMethod);
      expect(updatedAuthenticationMethod.authenticationComplement).to.be.an.instanceOf(AuthenticationMethod.PixAuthenticationComplement);
      expect(updatedAuthenticationMethod.authenticationComplement).to.deep.equal(expectedAuthenticationComplement);
    });

    it('should throw AuthenticationMethodNotFoundError when user id not found', async function() {
      // given
      const wrongUserId = 0;

      // when
      const error = await catchErr(authenticationMethodRepository.updatePasswordThatShouldBeChanged)({
        userId: wrongUserId,
        hashedPassword,
      });

      // then
      expect(error).to.be.instanceOf(AuthenticationMethodNotFoundError);
    });
  });

  describe('#createPasswordThatShouldBeChanged', function() {

    let userId;

    beforeEach(async function() {
      userId = databaseBuilder.factory.buildUser().id;
      databaseBuilder.factory.buildAuthenticationMethod({
        userId,
        identityProvider: AuthenticationMethod.identityProviders.GAR,
      });
      await databaseBuilder.commit();
    });

    it('should create password and set shouldChangePassword to true', async function() {
      // given
      const expectedAuthenticationComplement = new AuthenticationMethod.PixAuthenticationComplement({
        password: newHashedPassword,
        shouldChangePassword: true,
      });

      // when
      const createdAuthenticationMethod = await authenticationMethodRepository.createPasswordThatShouldBeChanged({
        userId,
        hashedPassword: newHashedPassword,
      });

      // then
      expect(createdAuthenticationMethod).to.be.an.instanceOf(AuthenticationMethod);
      expect(createdAuthenticationMethod.authenticationComplement).to.be.an.instanceOf(AuthenticationMethod.PixAuthenticationComplement);
      expect(createdAuthenticationMethod.authenticationComplement).to.deep.equal(expectedAuthenticationComplement);
    });

    it('should create PIX authenticationMethod and do not replace existing authenticationMethod', async function() {
      // given
      await authenticationMethodRepository.createPasswordThatShouldBeChanged({
        userId,
        hashedPassword: newHashedPassword,
      });

      // when
      const foundAuthenticationMethodPIX = await authenticationMethodRepository.findOneByUserIdAndIdentityProvider({
        userId,
        identityProvider: AuthenticationMethod.identityProviders.PIX,
      });
      const foundAuthenticationMethodGAR = await authenticationMethodRepository.findOneByUserIdAndIdentityProvider({
        userId,
        identityProvider: AuthenticationMethod.identityProviders.GAR,
      });

      // then
      expect(foundAuthenticationMethodPIX).to.exist;
      expect(foundAuthenticationMethodGAR).to.exist;
    });

  });

  describe('#updateExpiredPassword', function() {

    let userId;

    beforeEach(async function() {
      userId = databaseBuilder.factory.buildUser({ shouldChangePassword: true }).id;
      databaseBuilder.factory.buildAuthenticationMethod.buildWithHashedPassword({
        userId,
        hashedPassword,
        shouldChangePassword: true,
      });
      await databaseBuilder.commit();
    });

    it('should update password and set shouldChangePassword to false', async function() {
      // given
      const expectedAuthenticationComplement = new AuthenticationMethod.PixAuthenticationComplement({
        password: newHashedPassword,
        shouldChangePassword: false,
      });

      // when
      const updatedAuthenticationMethod = await authenticationMethodRepository.updateExpiredPassword({
        userId,
        hashedPassword: newHashedPassword,
      });

      // then
      expect(updatedAuthenticationMethod).to.be.an.instanceOf(AuthenticationMethod);
      expect(updatedAuthenticationMethod.authenticationComplement).to.be.an.instanceOf(AuthenticationMethod.PixAuthenticationComplement);
      expect(updatedAuthenticationMethod.authenticationComplement).to.deep.equal(expectedAuthenticationComplement);
    });

    it('should throw AuthenticationMethodNotFoundError when user id is not found', async function() {
      // given
      const wrongUserId = 0;

      // when
      const error = await catchErr(authenticationMethodRepository.updateExpiredPassword)({
        userId: wrongUserId,
        hashedPassword,
      });

      // then
      expect(error).to.be.instanceOf(AuthenticationMethodNotFoundError);
    });
  });

  describe('#updatePoleEmploiAuthenticationComplementByUserId', function() {

    context('When authentication method exists', function() {

      let poleEmploiAuthenticationMethod;

      beforeEach(function() {
        const userId = databaseBuilder.factory.buildUser().id;
        poleEmploiAuthenticationMethod = databaseBuilder.factory.buildAuthenticationMethod.buildPoleEmploiAuthenticationMethod({
          accessToken: 'to_be_updated',
          refreshToken: 'to_be_updated',
          expiredDate: Date.now(),
          userId,
        });
        return databaseBuilder.commit();
      });

      it('should update authentication complement by userId and identity provider', async function() {
        // given
        const userId = poleEmploiAuthenticationMethod.userId;
        const authenticationComplement = new AuthenticationMethod.PoleEmploiAuthenticationComplement({
          accessToken: 'new_access_token',
          refreshToken: 'new_refresh_token',
          expiredDate: Date.now(),
        });

        // when
        const updatedAuthenticationMethod = await authenticationMethodRepository.updatePoleEmploiAuthenticationComplementByUserId({ authenticationComplement, userId });

        // then
        expect(updatedAuthenticationMethod.authenticationComplement).to.deep.equal(authenticationComplement);
      });
    });

    context('When authentication method does not exist', function() {

      it('should throw a not found error', async function() {
        // given
        const userId = 12345;
        const authenticationComplement = {};

        // when
        const error = await catchErr(authenticationMethodRepository.updatePoleEmploiAuthenticationComplementByUserId)({ authenticationComplement, userId });

        // then
        expect(error).to.be.instanceOf(AuthenticationMethodNotFoundError);
      });
    });
  });

  describe('#hasIdentityProviderPIX', function() {

    it('should return true if user have an authenticationMethod with an IdentityProvider PIX ', async function() {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      databaseBuilder.factory.buildAuthenticationMethod.buildWithHashedPassword({
        userId,
      });
      await databaseBuilder.commit();

      // when
      const result = await authenticationMethodRepository.hasIdentityProviderPIX({
        userId,
      });

      // then
      expect(result).to.be.true;
    });

    it('should return false if user have no authenticationMethod with an IdentityProvider PIX ', async function() {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      databaseBuilder.factory.buildAuthenticationMethod({
        userId,
        identityProvider: AuthenticationMethod.identityProviders.GAR,
      });
      await databaseBuilder.commit();

      // when
      const result = await authenticationMethodRepository.hasIdentityProviderPIX({
        userId,
      });

      // then
      expect(result).to.be.false;
    });
  });

  describe('#updateOnlyShouldChangePassword', function() {

    let userId;

    beforeEach(async function() {
      userId = databaseBuilder.factory.buildUser().id;
      databaseBuilder.factory.buildAuthenticationMethod.buildWithHashedPassword({
        hashedPassword,
        shouldChangePassword: true,
        userId,
      });

      await databaseBuilder.commit();
    });

    context('when authentication method exists', function() {

      it('should update authentication complement by userId with shouldChangePassword false', async function() {
        // given
        const expectedAuthenticationComplement = new AuthenticationMethod.PixAuthenticationComplement({
          password: hashedPassword,
          shouldChangePassword: false,
        });

        // when
        const updatedAuthenticationMethod = await authenticationMethodRepository.updateOnlyShouldChangePassword({
          shouldChangePassword: false,
          userId,
        });

        // then
        expect(updatedAuthenticationMethod).to.be.an.instanceOf(AuthenticationMethod);
        expect(updatedAuthenticationMethod.authenticationComplement).to.deep.equal(expectedAuthenticationComplement);
      });
    });

    context('when authentication method does not exist', function() {

      it('should throw AuthenticationMethodNotFoundError', async function() {
        // given
        userId = 1;

        // when
        const error = await catchErr(authenticationMethodRepository.updateOnlyShouldChangePassword)({
          shouldChangePassword: false,
          userId,
        });

        // then
        expect(error).to.be.an.instanceOf(AuthenticationMethodNotFoundError);
      });
    });
  });

  describe('#removeByUserIdAndIdentityProvider', function() {

    it('should remove the authentication method by userId and identityProvider', async function() {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      const identityProvider = AuthenticationMethod.identityProviders.GAR;

      databaseBuilder.factory.buildAuthenticationMethod({
        identityProvider,
        externalIdentifier: 'externalIdentifier',
        userId,
      });
      await databaseBuilder.commit();

      // when
      await authenticationMethodRepository.removeByUserIdAndIdentityProvider({ userId, identityProvider });

      // then
      const result = await knex('authentication-methods').where({ userId, identityProvider }).first();
      expect(result).to.be.undefined;
    });
  });

  describe('#findByUserId', function() {

    it('should return the user\'s authentication methods', async function() {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      databaseBuilder.factory.buildAuthenticationMethod({
        identityProvider: AuthenticationMethod.identityProviders.GAR,
        externalIdentifier: 'externalIdentifier',
        userId });
      databaseBuilder.factory.buildAuthenticationMethod.buildWithHashedPassword({ userId });
      await databaseBuilder.commit();

      // when
      const result = await authenticationMethodRepository.findByUserId({ userId });

      // then
      expect(result.length).to.equal(2);
    });

    it('should return an empty array if user has no authentication methods', async function() {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      await databaseBuilder.commit();

      // when
      const result = await authenticationMethodRepository.findByUserId({ userId });

      // then
      expect(result.length).to.equal(0);
    });
  });
});
