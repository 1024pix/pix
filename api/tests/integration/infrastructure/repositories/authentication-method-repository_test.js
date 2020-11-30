const { expect, databaseBuilder, knex, catchErr, domainBuilder } = require('../../../test-helper');
const authenticationMethodRepository = require('../../../../lib/infrastructure/repositories/authentication-method-repository');
const AuthenticationMethod = require('../../../../lib/domain/models/AuthenticationMethod');
const { AlreadyExistingEntity, NotFoundError } = require('../../../../lib/domain/errors');

describe('Integration | Repository | AuthenticationMethod', () => {

  describe('#create', () => {

    afterEach(() => {
      return knex('authentication-methods').delete();
    });

    context('When creating a AuthenticationMethod containing an authentication complement', () => {

      it('should return an AuthenticationMethod', async () => {
        // given
        const userId = databaseBuilder.factory.buildUser().id;
        await databaseBuilder.commit();
        const authenticationMethod = domainBuilder.buildAuthenticationMethod.buildPasswordAuthenticationMethod({
          password: 'Password123',
          shouldChangePassword: false,
          userId,
        });

        // when
        const savedAuthenticationMethod = await authenticationMethodRepository.create({ authenticationMethod });

        expect(savedAuthenticationMethod).to.be.instanceOf(AuthenticationMethod);
      });
    });

    context('When creating a AuthenticationMethod containing an external identifier', () => {

      it('should return an AuthenticationMethod', async () => {
        // given
        const userId = databaseBuilder.factory.buildUser().id;
        await databaseBuilder.commit();

        const authenticationMethod = domainBuilder.buildAuthenticationMethod({
          identityProvider: AuthenticationMethod.identityProviders.GAR,
          externalIdentifier: 'externalIdentifier',
          userId,
        });

        // when
        const savedAuthenticationMethod = await authenticationMethodRepository.create({ authenticationMethod });

        // then
        expect(savedAuthenticationMethod).to.be.instanceOf(AuthenticationMethod);
      });
    });

    context('When an AuthenticationMethod already exist for an identity provider and an external identifier', () => {

      it('should throw an AlreadyExistingEntity', async () => {
        // given
        const identityProvider = AuthenticationMethod.identityProviders.GAR;
        const externalIdentifier = 'alreadyExistingExternalIdentifier';
        const userId = databaseBuilder.factory.buildUser().id;
        databaseBuilder.factory.buildAuthenticationMethod({
          identityProvider,
          externalIdentifier,
          userId: databaseBuilder.factory.buildUser().id,
        });
        await databaseBuilder.commit();

        const authenticationMethod = domainBuilder.buildAuthenticationMethod({ identityProvider, externalIdentifier, userId });

        // when
        const error = await catchErr(authenticationMethodRepository.create)({ authenticationMethod });

        // then
        expect(error).to.be.instanceOf(AlreadyExistingEntity);
      });
    });

    context('When an AuthenticationMethod already exist for an identity provider and a userId', () => {

      it('should throw an AlreadyExistingEntity', async () => {
        // given
        const identityProvider = AuthenticationMethod.identityProviders.GAR;
        const userId = databaseBuilder.factory.buildUser().id;
        databaseBuilder.factory.buildAuthenticationMethod({ identityProvider, externalIdentifier: 'externalIdentifier1', userId });
        await databaseBuilder.commit();

        const authenticationMethod = domainBuilder.buildAuthenticationMethod({ identityProvider, externalIdentifier: 'externalIdentifier2', userId });

        // when
        const error = await catchErr(authenticationMethodRepository.create)({ authenticationMethod });

        // then
        expect(error).to.be.instanceOf(AlreadyExistingEntity);
      });
    });
  });

  describe('#findOneByUserIdAndIdentityProvider', () => {

    it('should return the AuthenticationMethod associated to a user for a given identity provider', async () => {
      // given
      const identityProvider = AuthenticationMethod.identityProviders.GAR;
      const userId = databaseBuilder.factory.buildUser().id;
      databaseBuilder.factory.buildAuthenticationMethod.buildPasswordAuthenticationMethod({ userId });
      const garAuthenticationMethodInDB = databaseBuilder.factory.buildAuthenticationMethod({ identityProvider, userId });
      await databaseBuilder.commit();

      // when
      const authenticationMethodsByUserIdAndIdentityProvider = await authenticationMethodRepository.findOneByUserIdAndIdentityProvider({ userId, identityProvider });

      // then
      expect(authenticationMethodsByUserIdAndIdentityProvider).to.be.instanceof(AuthenticationMethod);
      expect(authenticationMethodsByUserIdAndIdentityProvider).to.deep.equal(garAuthenticationMethodInDB);
    });

    it('should return null if there is no AuthenticationMethod for the given user and identity provider', async () => {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      await databaseBuilder.commit();
      const identityProvider = AuthenticationMethod.identityProviders.GAR;

      // when
      const authenticationMethodsByUserIdAndIdentityProvider = await authenticationMethodRepository.findOneByUserIdAndIdentityProvider({ userId, identityProvider });

      // then
      expect(authenticationMethodsByUserIdAndIdentityProvider).to.be.null;
    });
  });

  describe('#findOneByExternalIdentifierAndIdentityProvider', () => {

    it('should return the AuthenticationMethod for a given external identifier and identity provider', async () => {
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

    it('should return null if there is no AuthenticationMethods for the given external identifier and identity provider', async () => {
      // given
      const identityProvider = AuthenticationMethod.identityProviders.GAR;
      const externalIdentifier = 'samlId';

      // when
      const authenticationMethodsByTypeAndValue = await authenticationMethodRepository.findOneByExternalIdentifierAndIdentityProvider({ externalIdentifier, identityProvider });

      // then
      expect(authenticationMethodsByTypeAndValue).to.be.null;
    });
  });

  describe('#updateExternalIdentifierByUserIdAndIdentityProvider', () => {

    context('When authentication method exists', async () => {

      let authenticationMethod;

      beforeEach(() => {
        const userId = databaseBuilder.factory.buildUser().id;
        authenticationMethod = databaseBuilder.factory.buildAuthenticationMethod({
          identityProvider: AuthenticationMethod.identityProviders.GAR,
          externalIdentifier: 'to_be_updated',
          userId,
        });
        return databaseBuilder.commit();
      });

      it('should update external identifier by userId and identity provider', async () => {
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

    context('When authentication method does not exist', async () => {

      it('should throw a not found error', async () => {
        // given
        const userId = 12345;
        const identityProvider = AuthenticationMethod.identityProviders.GAR;
        const externalIdentifier = 'new_saml_id';

        // when
        const error = await catchErr(authenticationMethodRepository.updateExternalIdentifierByUserIdAndIdentityProvider)({ externalIdentifier, userId, identityProvider });

        // then
        expect(error).to.be.instanceOf(NotFoundError);
      });
    });
  });

  describe('#updatePoleEmploiAuthenticationComplementByUserId', () => {

    context('When authentication method exists', async () => {

      let poleEmploiAuthenticationMethod;

      beforeEach(() => {
        const userId = databaseBuilder.factory.buildUser().id;
        poleEmploiAuthenticationMethod = databaseBuilder.factory.buildAuthenticationMethod.buildPoleEmploiAuthenticationMethod({
          accessToken: 'to_be_updated',
          refreshToken: 'to_be_updated',
          expiredDate: Date.now(),
          userId,
        });
        return databaseBuilder.commit();
      });

      it('should update authentication complement by userId and identity provider', async () => {
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

    context('When authentication method does not exist', async () => {

      it('should throw a not found error', async () => {
        // given
        const userId = 12345;
        const authenticationComplement = {};

        // when
        const error = await catchErr(authenticationMethodRepository.updatePoleEmploiAuthenticationComplementByUserId)({ authenticationComplement, userId });

        // then
        expect(error).to.be.instanceOf(NotFoundError);
      });
    });
  });

});
